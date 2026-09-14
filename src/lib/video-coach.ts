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
 * Videos due today or in the past, most recent first, capped at 7. Sorts by `data` descending
 * itself (rather than trusting the caller's ordering, e.g. `strapiVideoCoach`) — future-dated
 * entries (if any slipped into the latest-15 window the API returns) are dropped, never shown.
 */
export function visibleVideos(list: StrapiVideoCoach[]): StrapiVideoCoach[] {
  const today = todayISO();
  return [...list]
    .sort((a, b) => b.data.localeCompare(a.data))
    .filter((v) => v.data <= today)
    .slice(0, 7);
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
