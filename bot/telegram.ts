// Minimal Telegram Bot API client over fetch (no SDK dependency).
// The token is read lazily so importing this module is side-effect free — safe
// in a serverless function where process.exit() would kill the whole invocation.
function api(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN');
  return `https://api.telegram.org/bot${token}`;
}

export interface InlineButton { text: string; callback_data: string }

async function call(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${api()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) console.error(`Telegram ${method} failed:`, json.description);
  return json.result;
}

/** Point Telegram at a webhook URL (used by the Netlify deploy). */
export function setWebhook(url: string, secret?: string) {
  return call('setWebhook', {
    url,
    secret_token: secret,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });
}
export function deleteWebhook() {
  return call('deleteWebhook', { drop_pending_updates: false });
}

export function getMe() {
  return call('getMe', {});
}

export function sendMessage(chatId: number, text: string, keyboard?: InlineButton[][]) {
  return call('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined,
  });
}

export function editMessage(chatId: number, messageId: number, text: string, keyboard?: InlineButton[][]) {
  return call('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined,
  });
}

export function answerCallback(id: string, text?: string) {
  return call('answerCallbackQuery', { callback_query_id: id, text });
}

/** Long-polling update loop. */
export async function poll(onUpdate: (u: any) => void) {
  let offset = 0;
  // clear any pending webhook so getUpdates works
  await call('deleteWebhook', { drop_pending_updates: false });
  console.log('Bot polling started.');
  for (;;) {
    try {
      const res = await fetch(`${api()}/getUpdates?timeout=30&offset=${offset}`);
      const json = await res.json();
      if (json.ok) {
        for (const u of json.result) {
          offset = u.update_id + 1;
          try { onUpdate(u); } catch (e) { console.error('handler error', e); }
        }
      }
    } catch {
      await new Promise((r) => setTimeout(r, 3000)); // network blip — back off
    }
  }
}
