# Tomchi — backend setup (Supabase + AI + Telegram)

The web app works with **zero setup** on localStorage. Follow this to turn on
the connected features: app ↔ bot sync, and the AI plant doctor.

Everything below uses **free tiers** (Supabase + Groq).

---

## 1. Create a Supabase project (5 min)

1. Go to https://supabase.com → **New project** (free plan). Pick a region close to Uzbekistan (e.g. Frankfurt).
2. When it's ready, open **SQL Editor** → paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.
3. Enable anonymous logins: **Authentication → Providers → Anonymous → Enable**.
4. Copy from **Settings → API**:
   - `Project URL`
   - `anon public` key  → for the web app (public, safe)
   - `service_role` key → for the bot only (secret)

## 2. Wire the web app

Create `.env` in the project root (copy from `.env.example`):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

Rebuild / redeploy. A **"Connect Telegram"** card now appears on the dashboard,
and the AI tab in **Diagnosis** becomes active.

## 3. Get a free AI key (Groq) and deploy the functions

1. Sign up at https://console.groq.com → **API Keys** → create a key (free).
2. Install the Supabase CLI and log in: `npm i -g supabase` → `supabase login`.
3. Link and set secrets (from the project root):

   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase secrets set AI_API_KEY=gsk_your_groq_key
   # optional overrides (defaults shown):
   # supabase secrets set AI_BASE_URL=https://api.groq.com/openai/v1
   # supabase secrets set AI_MODEL=llama-3.3-70b-versatile
   # supabase secrets set AI_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
   supabase functions deploy diagnose
   supabase functions deploy diagnose-photo
   ```

   > Model IDs change over time — if a call fails, pick a current text/vision model
   > from the Groq docs and update `AI_MODEL` / `AI_VISION_MODEL`.
   > To switch provider entirely (OpenAI, Gemini via OpenAI-compat), just change
   > `AI_BASE_URL`, `AI_MODEL`, and `AI_API_KEY`.

## 4. Run the bot linked to the backend

In `bot/.env` (copy from `bot/.env.example`):

```
TELEGRAM_BOT_TOKEN=your_botfather_token
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

```bash
cd bot
npm install
npm start
```

## 5. Try the full loop

1. In the app: create a field → tap **Connect Telegram** → copy the `/link 123456` code.
2. In Telegram: open **@tomchiaibot** → send `/link 123456`.
3. Send `/today` — the bot answers using the field you set up in the app.
   Every day at 07:00 (Asia/Tashkent) it sends the reminder automatically.

---

### Security notes
- `anon` key is public by design (safe in the web bundle); Row Level Security keeps
  each device's data private (anonymous auth `owner = auth.uid()`).
- `service_role` key and the bot token live **only** in `bot/.env` / Supabase secrets
  — never in the web app or git.
