# 🌸 Study Nook

A cozy, all-in-one study session companion — everything on one page, behind a
Google login. Built with Next.js (App Router), TypeScript, Tailwind CSS v4, and
Auth.js v5.

## Features

All five live on a single dashboard:

- **⏱️ Focus timer** — toggle between a count-up **Stopwatch** and a **Pomodoro**
  (adjustable focus/break lengths, round counter, chime + browser notification).
  Tracks your total "focused today" time.
- **🎧 Lo-fi playlist** — paste any YouTube link to build a study playlist; plays
  in a privacy-enhanced embed, with titles auto-resolved (no API key).
- **📝 To-do list** — add tasks, check them off (with a satisfying strike-through),
  delete, and clear completed.
- **🔖 Bookmarks** — save links relevant to the session, with favicons; open in a
  new tab or remove.
- **🐱 Pet** — a little companion that wanders the page to keep you company
  (respects `prefers-reduced-motion`).

Everything is saved to your browser's **localStorage**, so it persists across
reloads on the same device.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # then fill in the values (see below)
pnpm dev                     # http://localhost:3000
```

Without Google credentials the app still boots and gates you to `/login` — you
just can't complete sign-in until you add them.

## Environment variables

See `.env.example`. `AUTH_SECRET` is already generated in your local `.env.local`.

| Variable             | Required  | Notes                                             |
| -------------------- | --------- | ------------------------------------------------- |
| `AUTH_SECRET`        | ✅        | Signs the session JWT. `openssl rand -base64 33`. |
| `AUTH_GOOGLE_ID`     | ✅        | Google OAuth client ID.                           |
| `AUTH_GOOGLE_SECRET` | ✅        | Google OAuth client secret.                       |
| `AUTH_TRUST_HOST`    | ✅ (prod) | Set `true` on Vercel / behind a proxy.            |
| `NEXT_PUBLIC_GA_ID`  | –         | Optional GA4 ID to enable analytics (see below).  |

## Setting up Google OAuth

You must create the OAuth client yourself in Google Cloud Console:

1. Go to <https://console.cloud.google.com/> → create (or pick) a project.
2. **APIs & Services → OAuth consent screen** → choose **External** → fill in app
   name + support email → add scopes `.../auth/userinfo.email` and
   `.../auth/userinfo.profile` → save. (Add yourself as a Test user while the app
   is in "Testing" mode.)
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** →
   application type **Web application**.
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR-VERCEL-DOMAIN/api/auth/callback/google`
5. Copy the **Client ID** and **Client secret** into `.env.local` as
   `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`, then restart `pnpm dev`.

## Analytics & conversion tracking (later)

The app ships tracking-free. A `track()` abstraction (`lib/analytics.ts`) already
fires events at key moments — `sign_in`, `timer_start`, `todo_completed`,
`bookmark_added`, etc. To turn on Google Analytics 4 (and Google Ads conversion
tracking), just set `NEXT_PUBLIC_GA_ID` to your GA4 Measurement ID — the tag loads
(`components/Analytics.tsx`) and those events start flowing immediately. Swap in
Google Tag Manager or an Ads tag there if you prefer.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it at <https://vercel.com/new> (Next.js is auto-detected — no build config).
3. In **Project Settings → Environment Variables**, add `AUTH_SECRET`,
   `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_TRUST_HOST=true`.
4. Add your production callback URL to the Google OAuth client (step 4 above).
5. Deploy.

## Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — ESLint

## Project structure

```
auth.ts                       Auth.js config (Google, JWT, route gating)
proxy.ts                      Edge gate (Next 16's middleware → proxy convention)
app/
  layout.tsx                  fonts, theme, analytics mount
  page.tsx                    protected dashboard (server)
  login/page.tsx              public sign-in page
  api/auth/[...nextauth]/     Auth.js handlers
  api/yt-title/               server-side YouTube title lookup (oEmbed)
components/
  dashboard/                  Dashboard + the 5 widgets
  ui/                         Card / Button / Input primitives
  UserMenu.tsx, Analytics.tsx
lib/
  useLocalStorage.ts          SSR-safe persistence (useSyncExternalStore)
  analytics.ts                track() abstraction
  youtube.ts                  URL parsing + oEmbed title
```

## Notes / future ideas

- Data is per-device (localStorage). The widgets are structured so a database
  could be layered in later without UI changes.
- A consent banner would be needed before enabling analytics in the EU.
- A dark "night study" theme would be a natural next addition.
