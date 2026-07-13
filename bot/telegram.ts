// Minimal Telegram Bot API client over fetch (no SDK dependency).
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error('Missing TELEGRAM_BOT_TOKEN. Create bot/.env with TELEGRAM_BOT_TOKEN=...');
  process.exit(1);
}
const API = `https://api.telegram.org/bot${TOKEN}`;

export interface InlineButton { text: string; callback_data: string }

async function call(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) console.error(`Telegram ${method} failed:`, json.description);
  return json.result;
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
      const res = await fetch(`${API}/getUpdates?timeout=30&offset=${offset}`);
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
