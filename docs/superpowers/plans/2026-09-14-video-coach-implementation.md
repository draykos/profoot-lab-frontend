# Video Coach Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "coming soon" `/mental` placeholder with a real Video Coach section — a video-of-the-day card in home, a `/video-coach` list capped at 7 past/today videos, and a full-screen player modal — backed by the existing `api::video-coach.video-coach` Strapi content-type.

**Architecture:** A small shared `src/lib/video-coach.ts` module in the frontend owns the date/selection logic (today-or-past filtering, 7-item cap, thumbnail fallback, category/date labels) so home and the section use one identical definition of "the video of the day". A single `VideoPlayerModal` component (full-screen overlay, Bunny Stream `<iframe>` embed) is reused by both entry points. The backend gets one small change: `video-coach.me` now caps results at the latest 15 server-side. No test framework exists in either repo (see both `CLAUDE.md` files) — verification is TypeScript compilation (`tsc --noEmit`), `eslint`, `vite build`, and documented manual checks against a running Strapi + the browser.

**Tech Stack:** TanStack Start/Router/Query, React 19, Tailwind v4, lucide-react (frontend); Strapi 5 Document Service API (backend).

---

## Before you start

- Frontend commands run from `profoot-lab-frontend/`, backend commands from `profoot-lab-backend/`. They are two separate git repositories — commit each independently, and **only add the files this plan touches** (`git add <specific files>`, never `git add -A`) since both repos may have unrelated local changes already in progress.
- Strapi dev server: `cd profoot-lab-backend && npm run develop` (http://localhost:1337). Frontend dev server: `cd profoot-lab-frontend && bun run dev`. `VITE_STRAPI_URL` must point at that Strapi instance (see `.env.example`).
- There is no automated test suite. Each task's "verify" step is either `bunx tsc --noEmit` (frontend type-check — fast, catches the type-consistency bugs this plan is most at risk of), or a manual step you run and read the output of before moving on.

---

### Task 1: Backend — cap `video-coach.me` at the latest 15

**Files:**
- Modify: `profoot-lab-backend/src/api/video-coach/controllers/video-coach.ts`

- [ ] **Step 1: Add the server-side limit**

Replace the `findMany` call (and its doc comment) with:

```ts
  /**
   * GET /api/video-coach/me
   *
   * Video coach assegnati all'atleta collegato all'utente autenticato, dal più recente (c'è un
   * video al giorno), limitati agli ultimi 15 (limit fisso lato server — Document Service API,
   * non la query REST `pagination[limit]`, quindi non richiedibile dal client). Il contenuto è
   * per singolo atleta: nessun filtro/populate/limite arbitrario accettato dal client, lo scoping
   * è sempre sull'atleta della richiesta corrente (per questo il ruolo Atleta non ha `find`/
   * `findOne` su questo content-type, solo questa azione).
   */
  async me(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized();
    }

    const atleta = await strapi.service('api::atleta.atleta').findForUser(userId);
    if (!atleta) {
      return ctx.notFound('Nessun profilo atleta collegato a questo utente');
    }

    const videoCoach = await strapi.documents('api::video-coach.video-coach').findMany({
      filters: { atleta: { id: atleta.id } },
      sort: { data: 'desc' },
      populate: { copertina: true },
      limit: 15,
    });

    const contentType = strapi.contentType('api::video-coach.video-coach');
    const sanitized = await strapi.contentAPI.sanitize.output(videoCoach, contentType, {
      auth: ctx.state.auth,
    });

    ctx.body = { data: sanitized };
  },
```

The rest of the file (imports, `factories.createCoreController` wrapper) is unchanged. Note: `limit`/`start` are **top-level** options on Document Service `findMany` — not nested under a `pagination` key (that nested form takes `page`/`pageSize` and is a different, REST-query-string convention). Getting this nesting wrong silently returns *all* rows instead of capping them.

- [ ] **Step 2: Verify it compiles and runs**

```bash
cd profoot-lab-backend
npm run develop
```

Expected: server starts on `http://localhost:1337` with no TypeScript errors printed for `video-coach.ts`. Leave it running for Step 3.

- [ ] **Step 3: Manually verify the cap**

With the dev server running, log in as an athlete user (via `POST /api/auth/local` or the frontend `/login` page) to get a JWT, then:

```bash
curl -s http://localhost:1337/api/video-coach/me -H "Authorization: Bearer <JWT>" | node -e "const d=JSON.parse(require('fs').readFileSync(0));console.log('count:', d.data.length)"
```

Expected: `count: <= 15` regardless of how many `video-coach` entries exist for that athlete (if the athlete currently has fewer than 15, the count will just match what exists — the important check is that it never exceeds 15 once you have more).

- [ ] **Step 4: Commit**

```bash
git add src/api/video-coach/controllers/video-coach.ts
git commit -m "feat(video-coach): cap the me endpoint at the latest 15 results" -m "" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Backend — update the content-type doc

**Files:**
- Modify: `profoot-lab-backend/docs/content-types/video-coach.md`

- [ ] **Step 1: Update the "Endpoint creato" section**

Find this paragraph (around line 22-27):

```
`GET /api/video-coach/me` — `src/api/video-coach/controllers/video-coach.ts` +
`src/api/video-coach/routes/video-coach-me.ts`. Stesso pattern di `allenamento.me` /
`test-fisico.me`: risolve l'atleta dall'utente autenticato via
`strapi.service('api::atleta.atleta').findForUser(userId)`, filtra per `atleta.id`, ordina per `data`
**discendente** (il video di oggi in cima), popola `copertina`. Nessun altro filtro/populate accettato
dal client.
```

Replace with:

```
`GET /api/video-coach/me` — `src/api/video-coach/controllers/video-coach.ts` +
`src/api/video-coach/routes/video-coach-me.ts`. Stesso pattern di `allenamento.me` /
`test-fisico.me`: risolve l'atleta dall'utente autenticato via
`strapi.service('api::atleta.atleta').findForUser(userId)`, filtra per `atleta.id`, ordina per `data`
**discendente** (il video di oggi in cima), popola `copertina`, **limitato ai 15 più recenti**
(`limit: 15` fisso lato server, Document Service API — non richiedibile dal client). Nessun altro
filtro/populate/limite accettato dal client.
```

- [ ] **Step 2: Resolve the "sezione coming soon" open decision**

Find this line in "Decisioni aperte" (around line 123):

```
- La sezione resta "coming soon" nel frontend finché non ci sono video pubblicati per l'atleta?
```

Replace with:

```
- ~~La sezione resta "coming soon" nel frontend finché non ci sono video pubblicati per l'atleta?~~
  Risolto 2026-09-14: la sezione `/video-coach` è reale, con un empty state dedicato quando
  l'atleta non ha video idonei (vedi `profoot-lab-frontend/docs/superpowers/specs/2026-09-14-video-coach-design.md`).
```

- [ ] **Step 3: Add a Changelog entry**

Append after the last entry in "## Changelog" (after the 2026-09-07 entry about the URL regex):

```
- **2026-09-14** — implementata la sezione frontend reale (`/video-coach`, ex `/mental`): video del
  giorno in home, lista degli ultimi 7 video idonei (oggi o passati, mai futuri), player in una
  modale Bunny Stream. Endpoint `me` limitato ai 15 risultati più recenti (`limit: 15`, Document
  Service API). Vedi lo spec di design nel repo frontend.
```

- [ ] **Step 4: Commit**

```bash
git add docs/content-types/video-coach.md
git commit -m "docs(video-coach): reflect the me endpoint limit and the real frontend section" -m "" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Frontend — fallback thumbnail asset

**Files:**
- Create: `profoot-lab-frontend/public/video-coach-fallback.jpg`

- [ ] **Step 1: Copy the provided image into the repo**

```bash
cp "/c/Users/giana/Downloads/video-thumbnail.jpg" "/c/MyProjects/Profoot Lab/profoot-lab-frontend/public/video-coach-fallback.jpg"
```

- [ ] **Step 2: Verify it's there and is a valid image**

```bash
cd profoot-lab-frontend
ls -la public/video-coach-fallback.jpg
file public/video-coach-fallback.jpg
```

Expected: file exists, `file` reports `JPEG image data`.

- [ ] **Step 3: Commit**

```bash
git add public/video-coach-fallback.jpg
git commit -m "feat(video-coach): add bundled fallback thumbnail" -m "" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Frontend — `strapi.ts` client for `video-coach.me`

**Files:**
- Modify: `profoot-lab-frontend/src/lib/strapi.ts`

- [ ] **Step 1: Append the type and function**

Add at the end of the file (after `strapiMediaUrl`):

```ts
export type VideoCoachCategoria = "pre_partita" | "focus" | "sonno" | "stress" | "recupero";

export interface StrapiVideoCoach {
  id: number;
  documentId: string;
  titolo: string;
  categoria: VideoCoachCategoria | null;
  durataMinuti: number | null;
  data: string;
  video: string;
  copertina: StrapiMedia | null;
}

/**
 * GET /api/video-coach/me — video coach assigned to the athlete linked to the current user, most
 * recent `data` first, capped server-side at the latest 15. Private per-athlete data: self-scoped
 * only, no arbitrary filters.
 */
export function strapiVideoCoach(token: string) {
  return request<{ data: StrapiVideoCoach[] }>("/api/video-coach/me", { method: "GET", token });
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd profoot-lab-frontend
bunx tsc --noEmit
```

Expected: no new errors (pre-existing errors, if any, are unrelated — the important thing is nothing about `strapi.ts` fails).

- [ ] **Step 3: Commit**

```bash
git add src/lib/strapi.ts
git commit -m "feat(video-coach): add strapiVideoCoach API client" -m "" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Frontend — `video-coach.ts` shared selection helpers

**Files:**
- Create: `profoot-lab-frontend/src/lib/video-coach.ts`

- [ ] **Step 1: Write the module**

```ts
/**
 * Shared helpers for `api::video-coach.video-coach` data, used by both the dashboard "video del
 * giorno" card (`/`) and the Video Coach section (`/video-coach`).
 */
import { strapiMediaUrl, type StrapiVideoCoach, type VideoCoachCategoria } from "@/lib/strapi";

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Local calendar date as YYYY-MM-DD — `data` on the server is a date-only field, no time/UTC. */
export function todayISO(): string {
  return toISODate(new Date());
}

/**
 * Videos due today or in the past, most recent first, capped at 7. `list` is assumed already
 * sorted by `data` descending (as returned by `strapiVideoCoach`) — future-dated entries (if any
 * slipped into the latest-15 window the API returns) are dropped, never shown.
 */
export function visibleVideos(list: StrapiVideoCoach[]): StrapiVideoCoach[] {
  const today = todayISO();
  return list.filter((v) => v.data <= today).slice(0, 7);
}

/** Today's video, or the most recent past one — same pick used in home and as the section hero. */
export function featuredVideo(list: StrapiVideoCoach[]): StrapiVideoCoach | null {
  return visibleVideos(list)[0] ?? null;
}

/** Resolves the cover image, falling back to the bundled placeholder when none was uploaded. */
export function videoThumbnail(v: StrapiVideoCoach): string {
  return strapiMediaUrl(v.copertina) ?? "/video-coach-fallback.jpg";
}

const CATEGORIA_KEY: Record<VideoCoachCategoria, string> = {
  pre_partita: "cat_pre_partita",
  focus: "cat_focus",
  sonno: "cat_sonno",
  stress: "cat_stress",
  recupero: "cat_recupero",
};

/** Translated label for `categoria`, or `null` when the video has none set. */
export function categoriaLabel(
  t: Record<string, string>,
  categoria: VideoCoachCategoria | null,
): string | null {
  if (!categoria) return null;
  return t[CATEGORIA_KEY[categoria]] ?? categoria;
}

export interface DayLabels {
  today: string;
  yesterday: string;
}

/** "Oggi" / "Ieri" / formatted date, depending on how `dataISO` compares to the current day. */
export function dayLabel(labels: DayLabels, dataISO: string, locale: string): string {
  if (dataISO === todayISO()) return labels.today;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dataISO === toISODate(yesterday)) return labels.yesterday;
  return new Date(`${dataISO}T00:00:00`).toLocaleDateString(locale);
}

export interface VideoModalData {
  titolo: string;
  video: string;
  categoriaLabel: string | null;
  dateLabel: string;
}

/** Maps a video-coach record to what `VideoPlayerModal` needs to render — pre-translated. */
export function toModalVideo(
  v: StrapiVideoCoach,
  categoriaT: Record<string, string>,
  dayLabels: DayLabels,
  locale: string,
): VideoModalData {
  return {
    titolo: v.titolo,
    video: v.video,
    categoriaLabel: categoriaLabel(categoriaT, v.categoria),
    dateLabel: dayLabel(dayLabels, v.data, locale),
  };
}
```

- [ ] **Step 2: Verify the logic with a throwaway script**

There's no test framework in this repo, so sanity-check the pure functions directly before wiring them into UI. Create a temporary file (do **not** commit it):

```bash
cat > /tmp/check-video-coach.ts <<'EOF'
import { visibleVideos, featuredVideo, dayLabel, todayISO } from "./src/lib/video-coach";
import type { StrapiVideoCoach } from "./src/lib/strapi";

const today = todayISO();
const mk = (data: string, id: number): StrapiVideoCoach => ({
  id, documentId: String(id), titolo: `v${id}`, categoria: null, durataMinuti: null,
  data, video: "https://example.com", copertina: null,
});

// Sorted desc as the API would return it: a future date, then today, then 8 past days.
const list = [mk("2999-01-01", 99), mk(today, 0), ...Array.from({ length: 8 }, (_, i) =>
  mk(new Date(Date.now() - (i + 1) * 86400000).toISOString().slice(0, 10), i + 1))];

const visible = visibleVideos(list);
console.log("visible count (expect 7):", visible.length);
console.log("no future dates (expect true):", visible.every((v) => v.data <= today));
console.log("featured is today's video (expect true):", featuredVideo(list)?.id === 0);
console.log("dayLabel today (expect Oggi):", dayLabel({ today: "Oggi", yesterday: "Ieri" }, today, "it-IT"));
EOF
cd profoot-lab-frontend
bunx tsx /tmp/check-video-coach.ts
rm /tmp/check-video-coach.ts
```

Expected output:
```
visible count (expect 7): 7
no future dates (expect true): true
featured is today's video (expect true): true
dayLabel today (expect Oggi): Oggi
```

If any line doesn't match, fix `video-coach.ts` before continuing — don't wire broken selection logic into the UI.

- [ ] **Step 3: Verify it compiles**

```bash
bunx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/video-coach.ts
git commit -m "feat(video-coach): add shared video selection and label helpers" -m "" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Frontend — i18n content

**Files:**
- Modify: `profoot-lab-frontend/src/lib/i18n.tsx`

- [ ] **Step 1: Trim the `home` namespace — IT**

In the `home.it` block, remove the now-dead mock keys (they're replaced by real data): delete these three lines —

```ts
      today_tuesday: "Oggi • Martedì",
      squat_title: "Squat esplosivi 4×6",
      squat_sub: "Forza • 12 min • con Coach Marco",
```

— keeping `video_of_day: "Video del giorno",` right above where they were (that key stays, it's still the badge label on the hero card).

- [ ] **Step 2: Trim the `home` namespace — EN**

Same in `home.en`, delete:

```ts
      today_tuesday: "Today • Tuesday",
      squat_title: "Explosive squats 4×6",
      squat_sub: "Strength • 12 min • with Coach Marco",
```

- [ ] **Step 3: Update the quick-access copy — IT**

In `home.it`, replace:

```ts
      qa_mental: "Mental Coach",
      qa_mental_sub: "Nuovo modulo",
```

with:

```ts
      qa_mental: "Video Coach",
      qa_mental_sub: "Il tuo video di oggi",
```

- [ ] **Step 4: Update the quick-access copy — EN**

In `home.en`, replace:

```ts
      qa_mental: "Mental Coach",
      qa_mental_sub: "New module",
```

with:

```ts
      qa_mental: "Video Coach",
      qa_mental_sub: "Your video for today",
```

- [ ] **Step 5: Replace the `mental` namespace with `videoCoach`**

Replace the entire `mental: { it: {...}, en: {...} }` block with:

```ts
  videoCoach: {
    it: {
      eyebrow: "Testa & Corpo",
      title: "Video Coach",
      previous: "Video precedenti",
      empty: "Nessun video assegnato al momento.",
      load_error: "Impossibile caricare i video. Riprova più tardi.",
      close: "Chiudi",
      cat_pre_partita: "Pre-partita",
      cat_focus: "Focus",
      cat_sonno: "Sonno",
      cat_stress: "Stress",
      cat_recupero: "Recupero",
    },
    en: {
      eyebrow: "Mind & Body",
      title: "Video Coach",
      previous: "Previous videos",
      empty: "No video assigned yet.",
      load_error: "Couldn't load videos. Please try again later.",
      close: "Close",
      cat_pre_partita: "Pre-match",
      cat_focus: "Focus",
      cat_sonno: "Sleep",
      cat_stress: "Stress",
      cat_recupero: "Recovery",
    },
  },
```

This namespace rename is safe: `DictNamespace` (in the same file) is `keyof typeof dict`, so `useT` typing follows automatically — the only call sites (`mental.tsx`) are rewritten in Task 8.

- [ ] **Step 6: Verify it compiles**

```bash
cd profoot-lab-frontend
bunx tsc --noEmit
```

Expected: errors pointing at `src/routes/mental.tsx` (it still calls `useT("mental")` and references dead `home` keys) — that's expected until Tasks 8-9 fix those files. No errors should point at `i18n.tsx` itself.

- [ ] **Step 7: Commit**

```bash
git add src/lib/i18n.tsx
git commit -m "feat(video-coach): replace mental i18n namespace with videoCoach content" -m "" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Frontend — `VideoPlayerModal` component

**Files:**
- Create: `profoot-lab-frontend/src/components/VideoPlayerModal.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useEffect } from "react";
import { X } from "lucide-react";
import type { VideoModalData } from "@/lib/video-coach";

interface VideoPlayerModalProps {
  video: VideoModalData | null;
  onClose: () => void;
  closeLabel: string;
}

/**
 * Full-screen player overlay, reused by the home "video del giorno" card and the Video Coach
 * list. Renders nothing (and unmounts the iframe) when `video` is null, so playback actually
 * stops on close instead of continuing muted in the background.
 */
export function VideoPlayerModal({ video, onClose, closeLabel }: VideoPlayerModalProps) {
  useEffect(() => {
    if (!video) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [video, onClose]);

  if (!video) return null;

  const src = `${video.video}${video.video.includes("?") ? "&" : "?"}autoplay=true`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-4 text-white">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{video.titolo}</p>
            <p className="text-xs text-white/60">
              {[video.categoriaLabel, video.dateLabel].filter(Boolean).join(" • ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            key={video.video}
            src={src}
            title={video.titolo}
            className="size-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd profoot-lab-frontend
bunx tsc --noEmit
```

Expected: no new errors pointing at `VideoPlayerModal.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/VideoPlayerModal.tsx
git commit -m "feat(video-coach): add full-screen VideoPlayerModal component" -m "" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Frontend — `/video-coach` route (replaces `/mental`)

**Files:**
- Delete: `profoot-lab-frontend/src/routes/mental.tsx`
- Create: `profoot-lab-frontend/src/routes/video-coach.tsx`

- [ ] **Step 1: Delete the old placeholder route**

```bash
cd profoot-lab-frontend
rm src/routes/mental.tsx
```

- [ ] **Step 2: Write the new route**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Play, Sparkles } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useLang, useT } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";
import { useAuth } from "@/lib/auth";
import { strapiVideoCoach, type StrapiVideoCoach } from "@/lib/strapi";
import {
  categoriaLabel,
  dayLabel,
  featuredVideo,
  toModalVideo,
  videoThumbnail,
  visibleVideos,
} from "@/lib/video-coach";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";

export const Route = createFileRoute("/video-coach")({
  component: VideoCoachPage,
  head: () => ({
    meta: [
      { title: "Video Coach — Profoot Lab" },
      {
        name: "description",
        content:
          "Il video coach assegnato dal tuo staff: un contenuto al giorno per preparazione mentale, respirazione e recupero.",
      },
      { property: "og:title", content: "Video Coach — Profoot Lab" },
      {
        property: "og:description",
        content:
          "Un video al giorno assegnato dal tuo staff: respirazione, visualizzazione, recupero.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/video-coach") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/video-coach") }],
  }),
});

const DAY_KEYS = ["d_dom", "d_lun", "d_mar", "d_mer", "d_gio", "d_ven", "d_sab"] as const;

function dayBadge(t: Record<string, string>, dataISO: string): { top: string; num: string } {
  const date = new Date(`${dataISO}T00:00:00`);
  return { top: t[DAY_KEYS[date.getDay()]], num: String(date.getDate()).padStart(2, "0") };
}

function VideoCoachPage() {
  const t = useT("videoCoach");
  const td = useT("train");
  const lang = useLang();
  const { jwt } = useAuth();
  const [openVideo, setOpenVideo] = useState<StrapiVideoCoach | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["video-coach", jwt],
    queryFn: () => strapiVideoCoach(jwt as string),
    enabled: !!jwt,
  });

  const locale = lang === "it" ? "it-IT" : "en-GB";
  const tRecord = t as unknown as Record<string, string>;
  const tdRecord = td as unknown as Record<string, string>;
  const dayLabels = { today: td.today, yesterday: td.yesterday };

  const visible = visibleVideos(data?.data ?? []);
  const hero = featuredVideo(data?.data ?? []);
  const rest = visible.slice(1);

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      {isPending && (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="py-6 text-center text-sm text-muted-foreground">{t.load_error}</p>
      )}

      {!isPending && !isError && !hero && (
        <Card className="flex flex-col items-center gap-2 !p-6 text-center">
          <Sparkles className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">{t.empty}</p>
        </Card>
      )}

      {hero && (
        <button
          type="button"
          className="mb-5 block w-full text-left"
          onClick={() => setOpenVideo(hero)}
        >
          <Card className="!p-0 overflow-hidden ring-0">
            <div className="relative aspect-video w-full">
              <img
                src={videoThumbnail(hero)}
                alt={hero.titolo}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
                {dayLabel(dayLabels, hero.data, locale)}
              </span>
              <span className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow">
                <Play className="size-5 fill-current" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                  {[
                    categoriaLabel(tRecord, hero.categoria),
                    hero.durataMinuti ? `${hero.durataMinuti} min` : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
                <p className="text-display mt-1 text-lg font-semibold text-white">
                  {hero.titolo}
                </p>
              </div>
            </div>
          </Card>
        </button>
      )}

      {rest.length > 0 && (
        <>
          <h3 className="mb-3 text-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t.previous}
          </h3>
          <div className="space-y-3">
            {rest.map((v) => {
              const badge = dayBadge(tdRecord, v.data);
              const cat = categoriaLabel(tRecord, v.categoria);
              return (
                <button
                  key={v.id}
                  type="button"
                  className="w-full text-left"
                  onClick={() => setOpenVideo(v)}
                >
                  <Card className="!p-3">
                    <div className="flex gap-3">
                      <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary py-2 text-muted-foreground">
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                          {badge.top}
                        </span>
                        <span className="text-display text-lg font-semibold text-foreground">
                          {badge.num}
                        </span>
                      </div>
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                        <img
                          src={videoThumbnail(v)}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="size-5 fill-white text-white" />
                        </span>
                      </div>
                      <div className="flex-1 py-1">
                        {cat && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                            {cat}
                          </span>
                        )}
                        <p className="mt-1 text-sm font-semibold leading-snug">{v.titolo}</p>
                        {v.durataMinuti != null && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {v.durataMinuti} min
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </>
      )}

      <VideoPlayerModal
        video={openVideo ? toModalVideo(openVideo, tRecord, dayLabels, locale) : null}
        onClose={() => setOpenVideo(null)}
        closeLabel={t.close}
      />
    </AppShell>
  );
}
```

- [ ] **Step 3: Regenerate the route tree and verify compilation**

```bash
cd profoot-lab-frontend
bun run dev &
sleep 4
bunx tsc --noEmit
```

Expected: `src/routeTree.gen.ts` picks up `/video-coach` automatically (TanStack Router's Vite plugin regenerates it while the dev server runs — do not hand-edit that file). `tsc --noEmit` should show no errors for `video-coach.tsx`. Stop the dev server afterwards (`kill %1` or Ctrl+C in that shell).

- [ ] **Step 4: Manual verification in the browser**

With `bun run dev` and the backend running, log in and navigate to `/video-coach`:
- With 0 eligible videos for the athlete: empty-state card with the "Nessun video assegnato al momento." message.
- With 1-7 eligible videos: hero card on top, remaining ones listed below, oldest at the bottom.
- With a video dated in the future seeded for the athlete: confirm it never appears here.
- Click the hero and a row: the full-screen modal opens with the Bunny iframe; `Esc`, the backdrop, and the X button all close it.

- [ ] **Step 5: Commit**

```bash
git add src/routes/mental.tsx src/routes/video-coach.tsx src/routeTree.gen.ts
git commit -m "feat(video-coach): implement the /video-coach section, replacing the /mental placeholder" -m "" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

(`git add` on a deleted path stages the deletion; if `routeTree.gen.ts` wasn't regenerated because you didn't run `bun run dev`, run it now before committing — a stale route tree makes `/video-coach` 404.)

---

### Task 9: Frontend — wire the home "video del giorno" card

**Files:**
- Modify: `profoot-lab-frontend/src/routes/index.tsx`

- [ ] **Step 1: Update imports**

Replace:

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  HeartPulse,
  Salad,
  Sparkles,
  Trophy,
  Video,
} from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useT } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";
import { useAuth } from "@/lib/auth";
import { strapiInfortuni } from "@/lib/strapi";
import { pickHomeInjury, zoneLabel, STATO_TO_SEVERITY, type Severity } from "@/lib/infortuni";
```

with:

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  HeartPulse,
  Salad,
  Sparkles,
  Trophy,
  Video,
} from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useLang, useT } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";
import { useAuth } from "@/lib/auth";
import { strapiInfortuni, strapiVideoCoach, type StrapiVideoCoach } from "@/lib/strapi";
import { pickHomeInjury, zoneLabel, STATO_TO_SEVERITY, type Severity } from "@/lib/infortuni";
import {
  categoriaLabel,
  dayLabel,
  featuredVideo,
  toModalVideo,
  videoThumbnail,
} from "@/lib/video-coach";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
```

- [ ] **Step 2: Add state and the video-coach query**

Replace:

```tsx
function HomePage() {
  const t = useT("home");
  const tb = useT("body");
  const { jwt } = useAuth();

  const { data } = useQuery({
    queryKey: ["infortuni", jwt],
    queryFn: () => strapiInfortuni(jwt as string),
    enabled: !!jwt,
  });
```

with:

```tsx
function HomePage() {
  const t = useT("home");
  const tb = useT("body");
  const tv = useT("videoCoach");
  const td = useT("train");
  const lang = useLang();
  const { jwt } = useAuth();
  const [openVideo, setOpenVideo] = useState<StrapiVideoCoach | null>(null);

  const { data } = useQuery({
    queryKey: ["infortuni", jwt],
    queryFn: () => strapiInfortuni(jwt as string),
    enabled: !!jwt,
  });

  const { data: videoCoachData } = useQuery({
    queryKey: ["video-coach", jwt],
    queryFn: () => strapiVideoCoach(jwt as string),
    enabled: !!jwt,
  });
```

- [ ] **Step 3: Derive the featured video**

Right after the query block from Step 2 (before `const homeInjury = ...`), add:

```tsx
  const locale = lang === "it" ? "it-IT" : "en-GB";
  const tvRecord = tv as unknown as Record<string, string>;
  const dayLabels = { today: td.today, yesterday: td.yesterday };
  const heroVideo = featuredVideo(videoCoachData?.data ?? []);
```

- [ ] **Step 4: Update the quick-access link**

Replace:

```tsx
    { to: "/mental", label: t.qa_mental, icon: Sparkles, sub: t.qa_mental_sub },
```

with:

```tsx
    { to: "/video-coach", label: t.qa_mental, icon: Sparkles, sub: t.qa_mental_sub },
```

- [ ] **Step 5: Replace the hardcoded "Video del giorno" card**

Replace the entire block:

```tsx
      {/* Video del giorno */}
      <Link to="/training" className="mb-4 block">
        <Card className="!p-0 overflow-hidden ring-0">
          <div className="relative aspect-video w-full">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=70"
              alt={t.video_of_day}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
              {t.video_of_day}
            </span>
            <span className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow">
              <Video className="size-5" />
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                {t.today_tuesday}
              </p>
              <h2 className="text-display mt-1 text-xl font-semibold leading-tight text-white">
                {t.squat_title}
              </h2>
              <p className="mt-1 text-xs text-white/70">{t.squat_sub}</p>
            </div>
          </div>
        </Card>
      </Link>
```

with:

```tsx
      {/* Video del giorno */}
      {heroVideo && (
        <button
          type="button"
          className="mb-4 block w-full text-left"
          onClick={() => setOpenVideo(heroVideo)}
        >
          <Card className="!p-0 overflow-hidden ring-0">
            <div className="relative aspect-video w-full">
              <img
                src={videoThumbnail(heroVideo)}
                alt={t.video_of_day}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
                {t.video_of_day}
              </span>
              <span className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow">
                <Video className="size-5" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                  {dayLabel(dayLabels, heroVideo.data, locale)}
                </p>
                <h2 className="text-display mt-1 text-xl font-semibold leading-tight text-white">
                  {heroVideo.titolo}
                </h2>
                <p className="mt-1 text-xs text-white/70">
                  {[
                    categoriaLabel(tvRecord, heroVideo.categoria),
                    heroVideo.durataMinuti ? `${heroVideo.durataMinuti} min` : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
            </div>
          </Card>
        </button>
      )}
```

- [ ] **Step 6: Mount the modal**

Replace the closing tag:

```tsx
    </AppShell>
  );
}
```

with:

```tsx
      <VideoPlayerModal
        video={openVideo ? toModalVideo(openVideo, tvRecord, dayLabels, locale) : null}
        onClose={() => setOpenVideo(null)}
        closeLabel={tv.close}
      />
    </AppShell>
  );
}
```

- [ ] **Step 7: Verify it compiles**

```bash
cd profoot-lab-frontend
bunx tsc --noEmit
```

Expected: no errors for `index.tsx`.

- [ ] **Step 8: Manual verification in the browser**

With both dev servers running:
- Athlete with an eligible video (today or a past one, not future): the home card shows its real thumbnail (or the fallback image if `copertina` is empty on that entry), title, and date badge; clicking it opens the modal.
- Athlete with zero eligible videos: confirm the card is not rendered at all (no empty placeholder box).
- Quick-access "Video Coach" tile navigates to `/video-coach`.

- [ ] **Step 9: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat(video-coach): wire the home video-of-the-day card to real data" -m "" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Frontend — sitemap entry

**Files:**
- Modify: `profoot-lab-frontend/src/routes/sitemap[.]xml.ts`

- [ ] **Step 1: Update the route path**

Replace:

```ts
          { path: "/mental", changefreq: "weekly", priority: "0.7" },
```

with:

```ts
          { path: "/video-coach", changefreq: "weekly", priority: "0.7" },
```

- [ ] **Step 2: Verify it compiles**

```bash
cd profoot-lab-frontend
bunx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add "src/routes/sitemap[.]xml.ts"
git commit -m "fix(video-coach): update sitemap entry from /mental to /video-coach" -m "" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Lint**

```bash
cd profoot-lab-frontend
bun run lint
```

Expected: no errors. Fix any that surface (e.g. unused imports left over from the edits) before continuing.

- [ ] **Step 2: Full type-check**

```bash
bunx tsc --noEmit
```

Expected: clean.

- [ ] **Step 3: Production build**

```bash
bun run build
```

Expected: build succeeds; check the output for the new `/video-coach` route and confirm `public/video-coach-fallback.jpg` is copied into the build output (`dist/` or the nitro output dir).

- [ ] **Step 4: End-to-end manual QA checklist**

With `profoot-lab-backend` (`npm run develop`) and `profoot-lab-frontend` (`bun run dev`) both running, using a Strapi user with an `atleta` profile, seed via the Strapi admin (Content Manager, not raw SQL — see the project `CLAUDE.md` guidance on direct DB writes) a mix of `video-coach` entries for that athlete: one dated today, several dated in the past (more than 7 total), and one dated a few days in the future. Then check:

- [ ] Home shows the hero card for today's video (not the future one, not an older past one).
- [ ] `/video-coach` shows exactly 7 videos, most recent first, oldest at the bottom; the future-dated one never appears.
- [ ] A video with no `copertina` uploaded shows `video-coach-fallback.jpg` as its thumbnail everywhere.
- [ ] Clicking any thumbnail (home or section) opens the full-screen modal with the Bunny player; `Esc`, backdrop click, and the X button each close it and stop playback (no audio after closing).
- [ ] Switch language (IT ↔ EN) via the header toggle and confirm all Video Coach copy (titles, "Oggi"/"Today", category labels, empty state) switches too.
- [ ] Remove all `video-coach` entries for the athlete (or test with a fresh athlete that has none): home hides the card entirely, `/video-coach` shows the empty-state message.

- [ ] **Step 5: No commit for this task** — it's verification only. If Step 1 or 4 surfaces a bug, fix it in the relevant task's files and amend that task's commit (or add a small follow-up commit), then re-run this task's steps.
