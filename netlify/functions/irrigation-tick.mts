// Scheduled function: closes irrigation sessions whose planned end has passed.
//
// A session is only ever described by its timestamps, so nothing has to stay
// awake while it runs — the phone can be off and the app closed. This is the
// piece that notices a watering has finished, records it, and tells the farmer.
//
// Every step is idempotent: the query only picks up rows still marked running,
// and `notified` guards the message, so a retry or an overlapping run cannot
// double-count the water or send the reminder twice.
import type { Config } from '@netlify/functions';
import { supa } from '../../bot/supa';
import { sendMessage } from '../../bot/telegram';

interface DueSession {
  id: string;
  owner: string;
  client_field_id: string;
  started_at: string;
  planned_liters: number;
  notified: boolean;
}

const m3 = (liters: number) => (liters / 1000).toFixed(1);

export default async (): Promise<Response> => {
  if (!supa) return new Response('supabase not configured', { status: 200 });

  const { data, error } = await supa
    .from('irrigation_sessions')
    .select('id, owner, client_field_id, started_at, planned_liters, notified')
    .eq('status', 'running')
    .lte('planned_end_at', new Date().toISOString())
    .limit(200);

  if (error) {
    console.error('irrigation-tick: query failed —', error.message);
    return new Response('query failed', { status: 500 });
  }

  const due = (data ?? []) as DueSession[];
  let closed = 0;
  let notified = 0;

  for (const s of due) {
    // Claim the row first. The `eq('status','running')` guard means a second
    // concurrent run updates nothing and moves on.
    const { data: claimed, error: claimErr } = await supa
      .from('irrigation_sessions')
      .update({
        status: 'done',
        ended_at: new Date().toISOString(),
        delivered_liters: s.planned_liters,
      })
      .eq('id', s.id)
      .eq('status', 'running')
      .select('id');

    if (claimErr || !claimed?.length) continue;
    closed++;

    // The watering journal is the app's single source of truth for "when was
    // this field last watered", so the finished session writes into it rather
    // than the calendar and impact screens learning about sessions separately.
    const { error: logErr } = await supa.from('watering_events').insert({
      owner: s.owner,
      client_field_id: s.client_field_id,
      type: 'watered',
      at: s.started_at,
    });
    if (logErr) console.error('irrigation-tick: journal insert failed —', logErr.message);

    await supa
      .from('fields')
      .update({ last_watered: s.started_at, updated_at: new Date().toISOString() })
      .eq('owner', s.owner)
      .eq('client_id', s.client_field_id);

    if (s.notified) continue;

    const { data: link } = await supa
      .from('bot_links')
      .select('chat_id, lang, subscribed')
      .eq('owner', s.owner)
      .maybeSingle();

    if (link?.chat_id && link.subscribed !== false) {
      const text =
        link.lang === 'ru'
          ? `Полив завершён. Вылито ${m3(s.planned_liters)} м³.`
          : `Sug‘orish tugadi. ${m3(s.planned_liters)} m³ suv quyildi.`;
      try {
        await sendMessage(Number(link.chat_id), text);
        notified++;
      } catch (e) {
        console.error('irrigation-tick: telegram send failed —', e);
      }
    }

    await supa.from('irrigation_sessions').update({ notified: true }).eq('id', s.id);
  }

  console.log(`irrigation-tick: ${closed} session(s) closed, ${notified} notified.`);
  return new Response('ok');
};

// Sessions run for tens of minutes to hours, so a five-minute cadence closes
// them promptly without burning invocations.
export const config: Config = { schedule: '*/5 * * * *' };
