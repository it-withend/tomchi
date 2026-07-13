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

## C. Keep the Telegram bot running (cloud)

The bot is a long-running Node process (`bot/`). Easiest free-ish host: **Railway**.

1. https://railway.app → **New Project → Deploy from GitHub repo** → `tomchi`.
2. In the service **Settings**:
   - **Root Directory**: `bot`
   - **Start Command**: `npm start`
3. **Variables** — add:
   - `TELEGRAM_BOT_TOKEN` = your BotFather token
   - `SUPABASE_URL` = `https://cgihysaztskxufwvtgja.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase **secret** key (`sb_secret_…`)
4. Deploy. The bot polls Telegram and sends the 07:00 Asia/Tashkent reminders.

> Alternatives: Render (Background Worker), Fly.io, or any always-on VPS.

## Security reminder
Rotate the keys you shared in chat once everything works:
Supabase (Settings → API → rotate), Groq (delete/recreate key), BotFather (`/revoke`).
Update them in Netlify/Railway env vars afterwards.
