// Local development entry: long-polling + node-cron. Production runs on Netlify
// (webhook function + scheduled function) and does NOT use this file — all the
// actual logic lives in handlers.ts, shared by both transports.
import 'dotenv/config';
import cron from 'node-cron';
import { getMe, poll } from './telegram';
import { handleUpdate, sendDailyReminders } from './handlers';

async function main() {
  const me = await getMe();
  console.log(`Tomchi bot @${me?.username} is live (local polling).`);

  // Every day at 07:00 Asia/Tashkent
  cron.schedule('0 7 * * *', sendDailyReminders, { timezone: 'Asia/Tashkent' });

  await poll(handleUpdate);
}

main();
