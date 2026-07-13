# Deploy Tomchi (GitHub → Netlify) + bot on the cloud

## A. Put the code on GitHub

1. Create an empty repo at https://github.com/new — name it `tomchi`,
   **do not** add a README/.gitignore (we already have them). Copy its URL.
2. In the project folder (`E:\presidentTECH`), run:

   ```bash
   git remote add origin https://github.com/<YOUR_USER>/tomchi.git
   git push -u origin main
   ```

   A browser window will ask you to sign in to GitHub — approve it.

> Prefer I push it for you? Create a GitHub token
> (https://github.com/settings/tokens → "Generate new token (classic)" → scope `repo`)
> and send it with the repo URL. I'll push and you skip the commands.

## B. Deploy the site on Netlify

1. https://app.netlify.com → **Add new site → Import an existing project → GitHub** →
   pick the `tomchi` repo.
2. Build settings are auto-detected from `netlify.toml` (build `npm run build`,
   publish `dist`, functions `netlify/functions`). Just click **Deploy**.
3. **Site configuration → Environment variables → Add** these:

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://cgihysaztskxufwvtgja.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_0xa_tK-K5Td75R3mWd1s6Q_SeQ_Y1qa` |
   | `AI_API_KEY` | *(your Groq key, starts with `gsk_`)* |

   Optional (defaults already work): `AI_MODEL`, `AI_VISION_MODEL`, `AI_BASE_URL`.
4. **Deploys → Trigger deploy → Clear cache and deploy** so the env vars apply.

Your public URL will be `https://<name>.netlify.app`. The AI doctor (text + photo)
runs on `/.netlify/functions/*` with the Groq key server-side.

### Add the site to Supabase allowed origins
Supabase → Authentication → URL Configuration → add your `https://<name>.netlify.app`
to **Site URL / Redirect URLs** (so anonymous auth works from the deployed site).

## C. Run the Telegram bot on Netlify (free, no separate host)

The bot runs as a **webhook function** + a **scheduled function** on the same
Netlify site — no always-on server, no Railway, no extra account.

1. **Run the DB migration.** Supabase → **SQL Editor** → paste the contents of
   `supabase/migrations/0002_bot_subscribers.sql` → **Run**. (Adds the
   `bot_subscribers` table used when a farmer sets up a field inside the bot.)
2. **Add bot env vars** in Netlify → Site configuration → Environment variables:

   | Key | Value |
   |-----|-------|
   | `TELEGRAM_BOT_TOKEN` | *(your BotFather token)* |
   | `SUPABASE_URL` | `https://cgihysaztskxufwvtgja.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(your Supabase `sb_secret_…` key)* |
   | `TELEGRAM_WEBHOOK_SECRET` | *(any long random string)* |

   `SUPABASE_SERVICE_ROLE_KEY` and `TELEGRAM_BOT_TOKEN` are server-side only —
   they run in functions and are never shipped to the browser (only `VITE_*`
   vars are). Do **not** prefix them with `VITE_`.
3. **Deploys → Trigger deploy → Clear cache and deploy site** so the vars apply.
4. **Register the webhook** (one time). Replace `<TOKEN>` and `<SECRET>`:

   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://tomchiai.netlify.app/.netlify/functions/telegram&secret_token=<SECRET>&drop_pending_updates=true"
   ```

   You should get `{"ok":true,"result":true,...}`. The bot now replies instantly,
   and the 07:00 Asia/Tashkent reminder fires from the scheduled function
   (`tomchi-daily`, cron `0 2 * * *` UTC).

> To go back to local testing later: `cd bot && npm start` (long-polling). Note
> that setting a webhook disables polling — run `deleteWebhook` first, and never
> run both at once (Telegram delivers updates to only one).

## Security reminder
Rotate the keys you shared in chat once everything works:
Supabase (Settings → API → rotate), Groq (delete/recreate key), BotFather (`/revoke`),
and the GitHub token. Update them in Netlify env vars afterwards.
