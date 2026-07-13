# Tomchi Telegram bot 🤖

Daily irrigation reminders for Uzbek farmers, powered by the same FAO-56 engine
as the Tomchi web app (`../src/engine`).

## What it does

- `/start` — guided setup (language → region → crop → method → soil)
- `/today` — today's water need, growth stage and interval
- Daily push at **07:00 Asia/Tashkent** with the day's norm
- Skips advice when Open-Meteo forecasts rain (≥5 mm) in the next 3 days
- `/stop` — pause reminders, `/help` — commands

## Run

```bash
cd bot
cp .env.example .env      # then paste your @BotFather token into .env
npm install
npm start
```

`.env` and `data/` (subscriber store) are gitignored — no secrets in the repo.

## Notes

- Reuses `../src/data` and `../src/engine/irrigation.ts` — single source of truth
  with the web app. Run via `tsx`, no build step.
- For production, host on any always-on Node process (Railway, Fly.io, a VPS)
  and swap the JSON store for a database.
