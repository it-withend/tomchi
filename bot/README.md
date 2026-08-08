# Tomchi Telegram bot 🤖

Daily irrigation reminders for Uzbek farmers, powered by the same FAO-56 engine
as the Tomchi web app (`../src/engine`).

## What it does

- `/start` — guided setup (language → region → crop → method → soil)
- `/link <code>` — attach a field created in the app, so both sides show the same one
- `/today` — today's water need, growth stage and interval
- Daily push at **07:00 Asia/Tashkent** with the day's norm
- Skips advice when Open-Meteo forecasts rain (≥5 mm) in the next 3 days
- `/stop` — pause reminders, `/help` — commands

## Run locally

```bash
cd bot
cp .env.example .env      # then paste your @BotFather token into .env
npm install
npm start
```

That is long-polling, for development. **In production the same handlers run as
a Netlify webhook function** (`netlify/functions/telegram.mts`) with the daily
reminder as a scheduled function — see [../DEPLOY.md](../DEPLOY.md). Telegram
delivers each update to one place only, so never run polling and the webhook at
the same time.

`.env` and `data/` (the local subscriber store) are gitignored. With Supabase
configured, subscribers live there instead and the bot reads them with the
service-role key.

## Notes

Reuses `../src/data` and `../src/engine/irrigation.ts`, so the bot and the app
cannot disagree about a norm. Run via `tsx`, no build step.
