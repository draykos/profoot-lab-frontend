/**
 * Shared helpers for `api::infortunio.infortunio` data, used by both the body map (`/body`)
 * and the dashboard alert strip (`/`).
 */
import type {
  InfortunioLato,
  InfortunioStato,
  InfortunioVista,
  InfortunioZona,
  StrapiInfortunio,
} from "@/lib/strapi";

export type View = "front" | "back";
export type Severity = "alert" | "warn" | "ok";
export type StatusKey = "recovering" | "active" | "resolved";

/** `stato` drives both the color (`severity`) and the status label — no separate field for it. */
export const STATO_TO_SEVERITY: Record<InfortunioStato, Severity> = {
  attivo: "alert",
  in_recupero: "warn",
  risolto: "ok",
};

export const STATO_TO_STATUS_KEY: Record<InfortunioStato, StatusKey> = {
  attivo: "active",
  in_recupero: "recovering",
  risolto: "resolved",
};

export const VISTA_TO_VIEW: Record<InfortunioVista, View> = {
  fronte: "front",
  retro: "back",
};

/** "Spalla – Destro" / "Lombare" (no side suffix for `centrale` or unset `lato`). */
export function zoneLabel(
  t: Record<string, string>,
  zona: InfortunioZona,
  lato: InfortunioLato | null,
): string {
  const zonaLabel = t[`zona_${zona}`] ?? zona;
  if (lato === "sinistro") return `${zonaLabel} – ${t.side_left}`;
  if (lato === "destro") return `${zonaLabel} – ${t.side_right}`;
  return zonaLabel;
}

/**
 * Dashboard alert pick: oldest `attivo`, else oldest `in_recupero`, else oldest `risolto`,
 * else `null` (nothing to show).
 */
export function pickHomeInjury(list: StrapiInfortunio[]): StrapiInfortunio | null {
  const oldestWithStato = (stato: InfortunioStato) =>
    list
      .filter((i) => i.stato === stato)
      .sort((a, b) => a.dataInsorgenza.localeCompare(b.dataInsorgenza))[0];

  return (
    oldestWithStato("attivo") ??
    oldestWithStato("in_recupero") ??
    oldestWithStato("risolto") ??
    null
  );
}
