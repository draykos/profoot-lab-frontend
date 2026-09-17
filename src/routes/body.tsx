import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import bodyFront from "@/assets/body-anatomy.jpg";
import bodyBack from "@/assets/body-anatomy-back.jpg";
import { useLang, useT } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";
import { useAuth } from "@/lib/auth";
import { strapiInfortuni, type StrapiInfortunio } from "@/lib/strapi";
import {
  STATO_TO_SEVERITY,
  STATO_TO_STATUS_KEY,
  VISTA_TO_VIEW,
  zoneLabel,
  type Severity,
  type StatusKey,
  type View,
} from "@/lib/infortuni";

export const Route = createFileRoute("/body")({
  component: BodyPage,
  head: () => ({
    meta: [
      { title: "Mappa corporea — Profoot Lab" },
      {
        name: "description",
        content:
          "Mappa anatomica frontale e posteriore con alert, stato di recupero e storico infortuni.",
      },
      { property: "og:title", content: "Mappa corporea — Profoot Lab" },
      {
        property: "og:description",
        content: "Visualizza fronte e retro del corpo, monitora alert e stati di recupero.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/body") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/body") }],
  }),
});

type Zone = {
  id: string;
  label: string;
  note: string;
  view: View;
  top: string;
  left: string;
  severity: Severity;
  statusKey: StatusKey;
  date: string;
};

const colorMap = {
  alert: "bg-destructive",
  warn: "bg-warning",
  ok: "bg-success",
} as const;

function mapZone(i: StrapiInfortunio, t: Record<string, string>, locale: string): Zone {
  return {
    id: i.documentId,
    label: zoneLabel(t, i.zona, i.lato),
    note: i.indicazioni || i.diagnosi || "",
    view: VISTA_TO_VIEW[i.vista],
    top: `${i.posizioneTop}%`,
    left: `${i.posizioneLeft}%`,
    severity: STATO_TO_SEVERITY[i.stato],
    statusKey: STATO_TO_STATUS_KEY[i.stato],
    date: new Date(i.dataInsorgenza).toLocaleDateString(locale),
  };
}

function BodyPage() {
  const t = useT("body");
  const lang = useLang();
  const { jwt } = useAuth();
  const [view, setView] = useState<View>("front");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["infortuni", jwt],
    queryFn: () => strapiInfortuni(jwt as string),
    enabled: !!jwt,
  });

  const locale = lang === "it" ? "it-IT" : "en-GB";
  const zones = useMemo(
    () => (data?.data ?? []).map((i) => mapZone(i, t as unknown as Record<string, string>, locale)),
    [data, t, locale],
  );

  const visibleZones = zones.filter((z) => z.view === view);
  const selected = visibleZones.find((z) => z.id === selectedId) ?? visibleZones[0] ?? null;

  const statusLabel = (k: StatusKey) =>
    k === "active" ? t.active : k === "recovering" ? t.recovering : t.resolved;

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-card p-1 ring-1 ring-inset ring-border">
        {(["front", "back"] as const).map((v) => {
          const active = v === view;
          const counts = zones.filter((z) => z.view === v && z.severity !== "ok").length;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center justify-center gap-2 rounded-full py-2 text-[11px] font-bold uppercase tracking-widest transition ${
                active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              {v === "front" ? t.front : t.back}
              {counts > 0 && (
                <span
                  className={`flex size-4 items-center justify-center rounded-full text-[9px] ${
                    active
                      ? "bg-accent-foreground/20 text-accent-foreground"
                      : "bg-destructive text-white"
                  }`}
                >
                  {counts}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Card className="mb-4 !p-3">
        <div className="relative aspect-[3/5] max-h-[56vh] w-full overflow-hidden rounded-xl bg-black">
          <img
            src={view === "front" ? bodyFront : bodyBack}
            alt={view === "front" ? t.front : t.back}
            className="h-full w-full object-contain"
          />
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-5 animate-spin text-white/70" />
            </div>
          )}
          {visibleZones.map((z) => {
            const active = selected?.id === z.id;
            return (
              <button
                key={z.id}
                aria-label={z.label}
                onClick={() => setSelectedId(z.id)}
                style={{ top: z.top, left: z.left }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  active ? "ring-2 ring-white" : ""
                }`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full ${colorMap[z.severity]}/25`}
                >
                  <span
                    className={`size-2.5 rounded-full ${colorMap[z.severity]} ${
                      z.severity === "alert" ? "animate-pulse-dot" : ""
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-around text-[10px] uppercase tracking-widest">
          <Legend color="bg-destructive" label={t.alert} />
          <Legend color="bg-warning" label={t.recovering} />
          <Legend color="bg-success" label={t.resolved} />
        </div>
      </Card>

      {isError && <Card className="!p-4 text-sm text-destructive">{t.load_error}</Card>}

      {!isError && !isPending && visibleZones.length === 0 && (
        <Card className="!p-4 text-sm text-muted-foreground">{t.no_injuries}</Card>
      )}

      {selected && (
        <Card className="!p-4">
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  selected.severity === "alert"
                    ? "text-destructive"
                    : selected.severity === "warn"
                      ? "text-warning"
                      : "text-success"
                }`}
              >
                {statusLabel(selected.statusKey)} • {selected.view === "front" ? t.front : t.back}
              </p>
              <p className="text-display mt-1 text-lg font-semibold">{selected.label}</p>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {selected.date}
            </span>
          </div>
          {selected.note && <p className="mt-2 text-sm text-muted-foreground">{selected.note}</p>}

          {zones.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t.history}
              </p>
              <ul className="space-y-2 text-xs">
                {zones.map((z) => (
                  <li key={z.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${colorMap[z.severity]}`} />
                      {z.label}
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        {z.view === "front" ? t.f_short : t.b_short}
                      </span>
                    </span>
                    <span className="text-muted-foreground">{z.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </AppShell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <span className={`size-1.5 rounded-full ${color}`} /> {label}
    </span>
  );
}
