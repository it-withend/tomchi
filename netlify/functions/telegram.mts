// Telegram webhook. Telegram POSTs each update here; we verify the secret token
// header, then run the shared bot logic. Free 24/7 — no always-on process.
import { handleUpdate } from '../../bot/handlers';

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('ok');

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return new Response('forbidden', { status: 403 });
  }

  try {
    const update = await req.json();
    await handleUpdate(update);
  } catch (e) {
    console.error('webhook error:', e);
  }
  // Always 200 so Telegram doesn't retry the same update forever.
  return new Response('ok');
};
