/**
 * Shared helpers for `api::piano-alimentare.piano-alimentare` data, used by both the dashboard
 * "Dieta" quick-access tile (`/`) and the diet screen (`/diet`).
 *
 * Kcal and macro totals are never stored in Strapi: they are always the sum of the plan's meals.
 */
import type { PastoTipo, StrapiPasto, StrapiPianoAlimentare } from "@/lib/strapi";
import { todayISO } from "@/lib/video-coach";

/**
 * Plan in force today: the most recent one with `validoDal <= today` and `validoAl` unset or
 * `>= today`. Sorts by `validoDal` itself rather than trusting the API ordering.
 */
export function currentPiano(list: StrapiPianoAlimentare[]): StrapiPianoAlimentare | null {
  const today = todayISO();
  return (
    [...list]
      .sort((a, b) => b.validoDal.localeCompare(a.validoDal))
      .find((p) => p.validoDal <= today && (!p.validoAl || p.validoAl >= today)) ?? null
  );
}

/** "07:30:00.000" → "07:30". */
export function formatOrario(orario: string): string {
  return orario.slice(0, 5);
}

/** Plan meals in chronological order. */
export function sortedPasti(piano: StrapiPianoAlimentare): StrapiPasto[] {
  return [...(piano.pasti ?? [])].sort((a, b) => a.orario.localeCompare(b.orario));
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
