/**
 * Shared helpers for `api::piano-alimentare.piano-alimentare` data, used by both the dashboard
 * "Dieta" quick-access tile (`/`) and the diet screen (`/diet`).
 *
 * Kcal and macro totals are never stored in Strapi: they are always the sum of the plan's meals.
 */
import type { GiornoSettimana, PastoTipo, StrapiPasto, StrapiPianoAlimentare } from "@/lib/strapi";

/** How many days the diet screen shows: today + the following six. */
export const DAYS_AHEAD = 7;

/** `Date.getDay()` index (0 = Sunday) → weekday key of `dieta.giorni-settimana`. */
const GIORNO_BY_DAY: GiornoSettimana[] = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];

/** Local calendar date as YYYY-MM-DD — `validoDal`/`validoAl` are date-only fields, no time/UTC. */
function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today (at local midnight) followed by the next `DAYS_AHEAD - 1` days. */
export function upcomingDays(from: Date = new Date()): Date[] {
  return Array.from(
    { length: DAYS_AHEAD },
    (_, i) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + i),
  );
}

/**
 * Plan in force on `date`: the most recent one with `validoDal <= date` and `validoAl` unset or
 * `>= date`. Sorts by `validoDal` itself rather than trusting the API ordering.
 */
export function pianoForDate(
  list: StrapiPianoAlimentare[],
  date: Date,
): StrapiPianoAlimentare | null {
  const day = toISODate(date);
  return (
    [...list]
      .sort((a, b) => b.validoDal.localeCompare(a.validoDal))
      .find((p) => p.validoDal <= day && (!p.validoAl || p.validoAl >= day)) ?? null
  );
}

/**
 * Meals of the template week that fall on `date`'s weekday, in chronological order. A meal with no
 * `giorni` set applies to every day.
 */
export function pastiForDate(piano: StrapiPianoAlimentare, date: Date): StrapiPasto[] {
  const giorno = GIORNO_BY_DAY[date.getDay()];
  return (piano.pasti ?? [])
    .filter((p) => !p.giorni || p.giorni[giorno])
    .sort((a, b) => a.orario.localeCompare(b.orario));
}

/** "07:30:00.000" → "07:30". */
export function formatOrario(orario: string): string {
  return orario.slice(0, 5);
}

/**
 * Kcal with thousands separator. `it-IT` skips grouping for 4-digit numbers by default ("2450"),
 * so grouping is forced to always get "2.450" / "2,450".
 */
export function formatKcal(kcal: number, locale: string): string {
  return kcal.toLocaleString(locale, { useGrouping: "always" } as Intl.NumberFormatOptions);
}

export interface PianoTotals {
  kcal: number;
  carboidratiG: number;
  proteineG: number;
  grassiG: number;
}

/** Daily totals = sum of every meal's values (missing macros count as 0). */
export function pianoTotals(pasti: StrapiPasto[]): PianoTotals {
  return pasti.reduce<PianoTotals>(
    (acc, p) => ({
      kcal: acc.kcal + p.kcal,
      carboidratiG: acc.carboidratiG + (p.carboidratiG ?? 0),
      proteineG: acc.proteineG + (p.proteineG ?? 0),
      grassiG: acc.grassiG + (p.grassiG ?? 0),
    }),
    { kcal: 0, carboidratiG: 0, proteineG: 0, grassiG: 0 },
  );
}

/**
 * Share of macro energy (carbs/protein 4 kcal/g, fats 9 kcal/g) for each macro, 0–1. Drives the
 * macro bars now that there are no stored targets to compare against.
 */
export function macroEnergyShares(totals: PianoTotals): { c: number; p: number; f: number } {
  const c = totals.carboidratiG * 4;
  const p = totals.proteineG * 4;
  const f = totals.grassiG * 9;
  const sum = c + p + f;
  if (sum === 0) return { c: 0, p: 0, f: 0 };
  return { c: c / sum, p: p / sum, f: f / sum };
}

/**
 * Index of the meal to highlight: the next one still to come today (first with `orario` at or
 * after the current time), or `-1` once the last meal of the day has passed.
 */
export function nextPastoIndex(pasti: StrapiPasto[], now: Date = new Date()): number {
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return pasti.findIndex((p) => formatOrario(p.orario) >= hhmm);
}

export const TIPO_KEY: Record<PastoTipo, "breakfast" | "snack" | "lunch" | "pre" | "dinner"> = {
  colazione: "breakfast",
  spuntino: "snack",
  pranzo: "lunch",
  pre_allenamento: "pre",
  cena: "dinner",
};
