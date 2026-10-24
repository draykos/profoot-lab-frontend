/**
 * Shared helpers for the athlete's match calendar (`api::calendario-partite.calendario-partite`),
 * used by both the dashboard "Next match" card (`/`) and the matches screen (`/matches`).
 */
import type { PartitaCompetizione, StrapiPartita } from "@/lib/strapi";

/**
 * Matches still to come — kicking off at or after `now` — in chronological order. There is no
 * stored status: a match is played once its `dataOra` has passed. Sorts by `dataOra` itself rather
 * than trusting the API ordering.
 */
export function upcomingPartite(list: StrapiPartita[], now: Date = new Date()): StrapiPartita[] {
  return list
    .filter((p) => new Date(p.dataOra).getTime() >= now.getTime())
    .sort((a, b) => a.dataOra.localeCompare(b.dataOra));
}

/** Calendar days between the local dates of `from` and `to` (times of day ignored). */
function calendarDaysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** "02 apr" (it) / "Apr 2" (en) — the date format of the matches list. */
export function formatMatchDate(dataOra: string, locale: string): string {
  const date = new Date(dataOra);
  return locale.startsWith("it")
    ? date.toLocaleDateString(locale, { day: "2-digit", month: "short" })
    : // Forced to en-US: en-GB would give "2 Apr" instead of the list's "Apr 2".
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Kick-off time as "20:45" (24h in every language, like the matches list). */
export function formatMatchTime(dataOra: string, locale: string): string {
  return new Date(dataOra).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export interface MatchDayLabels {
  today: string;
  tomorrow: string;
}

/**
 * Relative day of a match, for the dashboard card: "Oggi" / "Domani", the weekday name when the
 * match is 2–6 days away, and the plain date ("02 apr") from 7 days on — at exactly 7 days the
 * weekday would be the same as today's, so it would be ambiguous.
 */
export function matchDayLabel(
  labels: MatchDayLabels,
  dataOra: string,
  locale: string,
  now: Date = new Date(),
): string {
  const days = calendarDaysBetween(now, new Date(dataOra));
  if (days <= 0) return labels.today;
  if (days === 1) return labels.tomorrow;
  if (days < 7) {
    const weekday = new Date(dataOra).toLocaleDateString(locale, { weekday: "long" });
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }
  return formatMatchDate(dataOra, locale);
}

/** i18n key of each competition, resolved against the `matches` string bag. */
export const COMPETIZIONE_KEY: Record<
  PartitaCompetizione,
  "comp_serie_a" | "comp_champions" | "comp_coppa_italia" | "comp_amichevole"
> = {
  serie_a: "comp_serie_a",
  champions: "comp_champions",
  coppa_italia: "comp_coppa_italia",
  amichevole: "comp_amichevole",
};
