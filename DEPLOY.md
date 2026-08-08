# Deploy

The site and every serverless function live on one Netlify deployment. The
Telegram bot runs there too, as a webhook plus a scheduled function — no
always-on process to pay for.

Read [SETUP.md](SETUP.md) first; it explains what each variable is and which
feature it turns on.

## 1. The site

1. Push the repository to GitHub.
2. https://app.netlify.com → **Add new site → Import an existing project** →
   pick the repo. Build settings come from `netlify.toml`: `npm run build`,
   publish `dist`, functions `netlify/functions`.
3. **Site configuration → Environment variables** → add the client and server
   variables from SETUP.md. Only the `VITE_*` ones reach the browser.
4. **Deploys → Trigger deploy → Clear cache and deploy** so the variables apply.
   Vite reads `VITE_*` at build time, so a redeploy is required — restarting is
   not enough.
5. In Supabase → **Authentication → URL Configuration**, add the deployed origin,
   or anonymous sign-in will be refused from it.

## 2. The Telegram bot

The webhook **fails closed**: while `TELEGRAM_WEBHOOK_SECRET` is unset the
function refuses every update, so set it before registering the webhook.

Register it once, substituting your own token, secret and site:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<YOUR_SITE>.netlify.app/.netlify/functions/telegram&secret_token=<SECRET>&drop_pending_updates=true"
```

A `{"ok":true}` reply means the bot answers from then on, and the 07:00
Asia/Tashkent reminder fires from `tomchi-daily` (cron `0 2 * * *` UTC).

Setting a webhook disables long-polling. To go back to local polling, call
`deleteWebhook` first, and never run both.

## 3. Scheduled functions

Two run on a timer and need nothing beyond their environment variables:

| Function | Schedule | What it does |
|---|---|---|
| `tomchi-daily` | `0 2 * * *` UTC | The 07:00 Tashkent irrigation reminder |
| `irrigation-tick` | every 5 min | Closes finished irrigation sessions, writes the journal entry, notifies Telegram |

After the first deploy, check both appear under **Functions** in the Netlify
dashboard. A scheduled function that never registered simply never runs, and
nothing in the app will say so.

## Rotating keys

Anything that has ever been pasted into a chat, a screenshot or a demo should be
rotated: Supabase (Settings → API), Groq (delete and recreate), BotFather
(`/revoke`), and the Copernicus OAuth client. Update the Netlify variables
afterwards and redeploy.

The publishable Supabase key and project URL are compiled into the browser
bundle and cannot be hidden — that is expected. Row-level security is what keeps
each farmer's rows private, so treat RLS policies, not that key, as the boundary.
