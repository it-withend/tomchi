// Scheduled function: sends the morning irrigation reminder to every subscriber.
// Netlify cron runs in UTC — 02:00 UTC = 07:00 Asia/Tashkent (UTC+5).
import type { Config } from '@netlify/functions';
import { sendDailyReminders } from '../../bot/handlers';

export default async (): Promise<Response> => {
  await sendDailyReminders();
  return new Response('ok');
};

export const config: Config = { schedule: '0 2 * * *' };
