# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

`profoot-lab-frontend` is the player-facing frontend of **Profoot-Lab**, an app for professional
footballers. It was **generated with [Lovable](https://lovable.dev)** and is developed further
locally; the two stay in sync through the `main` branch (see `AGENTS.md`).

The companion repo `profoot-lab-backend` (a Strapi CMS, still to be built) is the intended data
source. Today the only real backend integration is authentication — every other screen renders
**hardcoded mock data**.

## Tech stack

- **TanStack Start** (SSR React framework) on **Vite 8**, **React 19**
- **TanStack Router** — file-based routing, `src/routes/`
- **TanStack Query** — client provided in `src/router.tsx`, not yet used for data fetching
- **Tailwind CSS v4** (CSS-first config) + **shadcn/ui** (new-york style, `src/components/ui/`)
- **Bun** as package manager (`bun.lock`, `bunfig.toml`)
- Deploy target: Cloudflare (via `nitro`, bundled in the Lovable Vite preset)
- TypeScript strict mode; path alias `@/*` → `src/*`

## Commands

```bash
bun install
bun run dev        # dev server
bun run build      # production build
bun run build:dev  # build in development mode
bun run preview
bun run lint       # eslint .
bun run format     # prettier --write .
```

No test framework is set up. Prettier config: 100 columns, semicolons, double quotes, trailing commas.

`bunfig.toml` blocks dependency versions younger than 24h (`minimumReleaseAge`). Ask the user before
adding entries to `minimumReleaseAgeExcludes`.

## Current contents

### Routes (`src/routes/`)

| Route | File | State |
| --- | --- | --- |
| `/` | `index.tsx` | Dashboard — video of the day, next match, body alert, quick-access grid. Mock data. |
| `/login` | `login.tsx` | Real Strapi login form. Exports shared `AuthField`. |
| `/forgot-password` | `forgot-password.tsx` | Real Strapi forgot-password flow. Exports `AuthLayout`. |
| `/reset-password` | `reset-password.tsx` | Real Strapi reset via `?code=`. |
| `/training` | `training.tsx` | Weekly list of daily training videos. Mock data. |
| `/test` | `test.tsx` | Physical-test results + a hand-drawn SVG trend chart. Mock data. |
| `/body` | `body.tsx` | Anatomical body map (front/back images), injury zones + history. Mock data. |
| `/diet` | `diet.tsx` | Daily meal plan with macros. Mock data. |
| `/matches` | `matches.tsx` | Match calendar, next match highlighted. Mock data. |
| `/mental` | `mental.tsx` | Placeholder "coming soon" section. |
| `/highlights` | `highlights.tsx` | Video-clip gallery. Mock data. |
| `/profile` | `profile.tsx` | Player bio/measurements (mock) + language switch + logout (real). |
| `/sitemap.xml` | `sitemap[.]xml.ts` | Generated sitemap. |

`src/routeTree.gen.ts` is auto-generated — never edit it. `src/routes/__root.tsx` is the only
layout. Route conventions are documented in `src/routes/README.md` (do not introduce `src/pages/` or
`app/layout.tsx` — those are Next.js/Remix patterns).

Most `head()` blocks contain canonical/OG URLs pointing at a `kick-start-coach-39.lovable.app`
preview domain — update these when the real domain is known.

### Library code (`src/lib/`)

- **`strapi.ts`** — the entire backend client. Users & Permissions REST only: `strapiLogin`
  (`/api/auth/local`), `strapiForgotPassword`, `strapiResetPassword`, `strapiMe`
  (`/api/users/me`). Base URL from `VITE_STRAPI_URL` (`.env.example`), fallback `https://strapi.test`.
  `StrapiError` carries an HTTP `status`.
- **`auth.tsx`** — `AuthProvider` (mounted in `__root.tsx`) stores `{ jwt, user }` in `localStorage`
  key `profoot_auth`, checks the JWT `exp` claim client-side, and best-effort revalidates with
  `strapiMe`. `useRequireAuth()` redirects to `/login` when unauthenticated.
  **Temporary dev backdoor:** `admin@test.com` / `admin` → fake JWT `"12345678"`; remove once the
  Strapi backoffice is live.
- **`i18n.tsx`** — hand-rolled i18n (no library). A single large typed `dict` object, namespaced;
  `useT("namespace")` returns the string bag for the active language. `it` (default) and `en`,
  persisted in `localStorage` key `atleta_lang`. **All UI copy for every screen currently lives
  here**, alongside a lot of the mock content. `LanguageToggle` / `LanguageProvider` also exported.
- **`error-capture.ts`, `error-page.ts`, `lovable-error-reporting.ts`** — support the custom SSR
  error handling in `src/server.ts` / `src/start.ts`.

### Components

- **`components/AppShell.tsx`** — the standard screen scaffold: `max-w-lg` container, header with
  `eyebrow` / `title` / `action` slots, fixed floating bottom nav (Home / Training / Test / Body /
  Profile). Calls `useRequireAuth()`, so **wrapping a page in `AppShell` makes it auth-gated**.
  Also exports a lightweight local `Card`. The `/login`, `/forgot-password`, `/reset-password`
  routes do not use `AppShell`.
- **`components/ui/`** — shadcn/ui primitives. Add more with the shadcn CLI per `components.json`.
- **`hooks/use-mobile.tsx`** — viewport breakpoint hook.

### Styling

- `src/styles.css` — Tailwind v4 `@theme inline` with an OKLCH lime/green dark palette, plus custom
  utilities `text-display` and `card-surface`.
- **Dark mode is forced** — `<html lang="it" class="dark">` in `__root.tsx`; there is no light theme.
- Fonts: Outfit (display) and Inter (body), loaded via `@fontsource` in `__root.tsx`.

### Server / build wiring

- `vite.config.ts` uses `@lovable.dev/vite-tanstack-config`, which **already includes** tanstackStart,
  viteReact, tailwindcss, tsConfigPaths, nitro, the `@` alias, env injection, and error-logger
  plugins. Do **not** re-add any of these — duplicates break the build.
- `src/server.ts` — custom server entry wrapping `@tanstack/react-start/server-entry`; converts
  h3-swallowed 500 JSON responses into a real HTML error page.
- `src/start.ts` — `createStart` with an error-catching request middleware.

## Working with this repo

- Connected to Lovable: **do not rewrite pushed git history** (no force-push / rebase / amend /
  squash of pushed commits) and keep `main` in a working state, since commits sync back to the
  Lovable editor.
- When wiring a screen to real data, replace the in-component mock arrays and move fetches into
  TanStack Query hooks that call a (to-be-expanded) `src/lib/strapi.ts`; keep display strings in
  `src/lib/i18n.tsx`.
