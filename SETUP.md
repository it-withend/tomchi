# Setup

The app runs with **no configuration at all**: irrigation norms, the soil-water
balance, the calendar and the savings screen are computed on the device and
stored in `localStorage`.

```bash
npm install
npm run dev
```

Everything below is optional and turns on one connected feature each. All of it
fits in free tiers.

| You want | You need |
|---|---|
| Sync between devices, Telegram link, remote irrigation | Supabase |
| AI agronomist: chat, photo diagnosis, voice input | Groq API key |
| Field health from space (NDVI) | Copernicus Data Space OAuth client |
| The Telegram bot itself | BotFather token |

Serverless functions do not run under `npm run dev`; calls to
`/.netlify/functions/*` will 404. To exercise them locally use `npx netlify dev`
instead, with the server variables below in a root `.env`.

---

## Supabase

1. Create a project at https://supabase.com (free plan; a region near Uzbekistan,
   e.g. Frankfurt).
2. **SQL Editor** → run every file in [`supabase/migrations/`](supabase/migrations/)
   in order, `0001` through `0004`. They create the field tables and their
   row-level-security policies, the bot's subscriber and link tables, and the
   devices and irrigation-session tables. Skipping any of them leaves a feature
   silently broken.
3. **Authentication → Providers → Anonymous → Enable.** The app never asks for a
   password; each device gets an anonymous identity and RLS ties every row to it.
4. **Authentication → URL Configuration** → add the origin you serve the app from.

Copy from **Settings → API**: the project URL, the publishable (`anon`) key, and
the secret (`service_role`) key.

## Environment variables

Client — these are compiled into the browser bundle, so they are public by
design. Row-level security is what protects the data, not their secrecy.

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable key |
| `VITE_AI_URL` | Optional. Override the functions base if you host them elsewhere. |

Server — read only inside functions and the bot. **Never** prefix these with
`VITE_`; that would publish them.

| Variable | Purpose |
|---|---|
| `AI_API_KEY` | Groq key from https://console.groq.com |
| `SUPABASE_URL` | Same project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key; bypasses RLS |
| `SH_CLIENT_ID`, `SH_CLIENT_SECRET` | Copernicus Data Space OAuth client, for NDVI |
| `TELEGRAM_BOT_TOKEN` | BotFather token |
| `TELEGRAM_WEBHOOK_SECRET` | Any long random string. The webhook refuses every update while this is unset. |
| `TOMCHI_SITE_URL` | Optional. The address the bot links back to. |

Model ids drift; override them if a call starts failing: `AI_MODEL`,
`AI_VISION_MODEL`, `AI_WHISPER_MODEL`, `AI_BASE_URL`. `AI_BASE_URL` is
OpenAI-compatible, so another provider works by changing these four alone.

Copy `.env.example` to `.env` for the client variables, and `bot/.env.example`
to `bot/.env` if you run the bot locally. Neither `.env` is ever committed.

## Field health from space

Register an OAuth client at the
[Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu) dashboard
(User Settings → OAuth clients) and set `SH_CLIENT_ID` / `SH_CLIENT_SECRET`.
Sentinel-2 imagery is free; the processing quota is metered, which is why the
function is rate-limited and the client caches a scene for a day.

Without these the satellite card says the data is unavailable and the rest of
the app is unaffected.

## Telegram bot

For production the bot runs as a webhook function on the same deployment — see
[DEPLOY.md](DEPLOY.md). For local work it can long-poll instead:

```bash
cd bot
npm install
npm start
```

Never run polling and a webhook at the same time; Telegram delivers each update
to only one of them.

To check the loop end to end: create a field in the app, tap **Connect
Telegram**, and send the `/link` code it shows to the bot. `/today` should then
answer with that field, and the daily reminder goes out at 07:00 Asia/Tashkent.

---

Deployment lives in [DEPLOY.md](DEPLOY.md). The design decisions behind the
irrigation control are in
[docs/superpowers/specs](docs/superpowers/specs/2026-07-27-remote-irrigation-design.md).
