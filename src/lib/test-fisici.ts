/**
 * Helpers for `api::test-fisico.test-fisico` data used by the physical tests screen (`/test`).
 */
import type { StrapiTestFisico, StrapiTipoTest } from "@/lib/strapi";

/** A test type is hidden when its latest measurement is older than this. */
export const MAX_DAYS_SINCE_LAST = 14;
/** Months shown in the trend chart (current month included). */
export const TREND_MONTHS = 3;

export interface TestPoint {
  /** Local midnight of the measurement day. */
  date: Date;
  valore: number;
}

export interface TestGroup {
  tipo: StrapiTipoTest;
  /** All measurements of this type, oldest first. */
  points: TestPoint[];
  latest: TestPoint;
  previous: TestPoint | null;
  daysSinceLast: number;
}

const DAY_MS = 86_400_000;

/** Parses a Strapi `date` ("YYYY-MM-DD") as local midnight, avoiding UTC day shifts. */
export function parseDay(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

/**
 * Groups measurements by test type and keeps only the types tested in the last
 * `MAX_DAYS_SINCE_LAST` days, sorted alphabetically by name.
 */
export function groupTests(list: StrapiTestFisico[], today: Date, locale: string): TestGroup[] {
  const byCode = new Map<string, { tipo: StrapiTipoTest; points: TestPoint[] }>();
  for (const item of list) {
    if (!item.tipoTest) continue;
    const entry = byCode.get(item.tipoTest.codice) ?? { tipo: item.tipoTest, points: [] };
    entry.points.push({ date: parseDay(item.data), valore: Number(item.valore) });
    byCode.set(item.tipoTest.codice, entry);
  }

  const groups: TestGroup[] = [];
  for (const { tipo, points } of byCode.values()) {
    points.sort((a, b) => a.date.getTime() - b.date.getTime());
    const latest = points[points.length - 1];
    const daysSinceLast = daysBetween(latest.date, today);
    if (daysSinceLast > MAX_DAYS_SINCE_LAST) continue;
    groups.push({
      tipo,
      points,
      latest,
      previous: points.length > 1 ? points[points.length - 2] : null,
      daysSinceLast,
    });
  }

  return groups.sort((a, b) => a.tipo.nome.localeCompare(b.tipo.nome, locale));
}

/** First day of the trend window: the 1st of the month `TREND_MONTHS - 1` months ago. */
export function trendStart(today: Date): Date {
  return new Date(today.getFullYear(), today.getMonth() - (TREND_MONTHS - 1), 1);
}

/** True when the change from `previous` to `latest` is an improvement for this test type. */
export function isImprovement(tipo: StrapiTipoTest, delta: number): boolean {
  return tipo.direzioneMigliora === "giu" ? delta < 0 : delta > 0;
}

/** Decimal places shown per unit: meters are whole, seconds have hundredths. */
export function decimalsFor(tipo: StrapiTipoTest): number {
  return tipo.unita === "m" ? 0 : tipo.unita === "s" ? 2 : 1;
}
