// Telegram webhook. Telegram POSTs each update here; we verify the secret token
// header, then run the shared bot logic. Free 24/7 — no always-on process.
import { handleUpdate } from '../../bot/handlers';

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('ok');

  // Fail closed. This used to skip the check entirely when the variable was
  // unset, which left the endpoint open: its URL is in the deploy guide, and
  // anyone who posted a hand-written "update" would be answered as though
  // Telegram had sent it, driving writes that run with the service role.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    console.error('TELEGRAM_WEBHOOK_SECRET is not set — refusing every update');
    return new Response('not configured', { status: 503 });
  }
  if (req.headers.get('x-telegram-bot-api-secret-token') !== secret) {
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
