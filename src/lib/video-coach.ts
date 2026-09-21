/**
 * Shared helpers for `api::video-coach.video-coach` data, used by both the dashboard "video del
 * giorno" card (`/`) and the training video list (`/training`).
 */
import type { StrapiVideoCoach, VideoCoachCategoria } from "@/lib/strapi";

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

/**
 * Cover image, sourced from Bunny's auto-generated video thumbnail rather than the Strapi
 * `copertina` field (ignored entirely — editorial control over the thumbnail, if ever needed,
 * happens by uploading a custom one in the Bunny dashboard for that video, not in Strapi).
 */
export function videoThumbnail(v: StrapiVideoCoach): string {
  return toThumbnailUrl(v.video);
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
  poster: string;
  categoriaLabel: string | null;
  dateLabel: string;
}

const BUNNY_PLAY_URL = /^https:\/\/player\.mediadelivery\.net\/play\/(\d+)\/([0-9a-f-]+)/i;

// TEMPORARY: hardcoded pull zone hostname for the native <video> + hls.js migration test. Move to
// an env var (alongside VITE_STRAPI_URL) once this approach is confirmed.
const BUNNY_PULL_ZONE_HOST = "vz-88c9ce19-ea7.b-cdn.net";

/**
 * Bunny Stream's "play" page (`player.mediadelivery.net/play/...`, the URL shown by its share/copy
 * link) only encodes `libraryId`/`videoId` — extract the video GUID, everything else (HLS
 * playlist, thumbnail) is served from the same pull zone at a predictable path built from it.
 */
function extractVideoId(url: string): string | null {
  const match = url.match(BUNNY_PLAY_URL);
  return match?.[2] ?? null;
}

/**
 * Direct HLS playlist URL for native <video>/hls.js playback, instead of Bunny's iframe embed
 * (which doesn't size correctly for non-16:9 content and resizes unpredictably after load — see
 * conversation/investigation notes).
 */
function toHlsUrl(url: string): string {
  const videoId = extractVideoId(url);
  return videoId ? `https://${BUNNY_PULL_ZONE_HOST}/${videoId}/playlist.m3u8` : url;
}

/**
 * Bunny's auto-generated thumbnail for the video, same pull zone/path pattern as the HLS files.
 * Falls back to the bundled placeholder only if the stored URL doesn't match the expected Bunny
 * "play" format at all (so `videoId` can't be extracted).
 */
function toThumbnailUrl(url: string): string {
  const videoId = extractVideoId(url);
  return videoId
    ? `https://${BUNNY_PULL_ZONE_HOST}/${videoId}/thumbnail.jpg`
    : "/video-coach-fallback.jpg";
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
    video: toHlsUrl(v.video),
    poster: toThumbnailUrl(v.video),
    categoriaLabel: categoriaLabel(categoriaT, v.categoria),
    dateLabel: dayLabel(dayLabels, v.data, locale),
  };
}
