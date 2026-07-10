import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
import bodyFront from "@/assets/body-anatomy.jpg";
import bodyBack from "@/assets/body-anatomy-back.jpg";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/body")({
  component: BodyPage,
  head: () => ({
    meta: [
      { title: "Mappa corporea — Sistema Atleta Pro" },
      { name: "description", content: "Mappa anatomica frontale e posteriore con alert e storico infortuni." },
    ],
  }),
});

type View = "front" | "back";
type Severity = "alert" | "warn" | "ok";
type StatusKey = "recovering" | "active" | "resolved";
type ZoneKey = "z1" | "z2" | "z3" | "z4" | "z5";
type NoteKey = "z1_note" | "z2_note" | "z3_note" | "z4_note" | "z5_note";

type Zone = {
  id: string;
  nameKey: ZoneKey;
  noteKey: NoteKey;
  view: View;
  top: string;
  left: string;
  severity: Severity;
  statusKey: StatusKey;
  date: string;
};

const zones: Zone[] = [
  { id: "quad-l", nameKey: "z1", noteKey: "z1_note", view: "front", top: "58%", left: "42%", severity: "alert", statusKey: "active", date: "12/03/2024" },
  { id: "ankle-r", nameKey: "z2", noteKey: "z2_note", view: "front", top: "88%", left: "58%", severity: "warn", statusKey: "recovering", date: "04/02/2024" },
  { id: "shoulder-r", nameKey: "z3", noteKey: "z3_note", view: "front", top: "22%", left: "62%", severity: "ok", statusKey: "resolved", date: "18/11/2023" },
  { id: "hamstring-r", nameKey: "z4", noteKey: "z4_note", view: "back", top: "60%", left: "56%", severity: "warn", statusKey: "recovering", date: "20/02/2024" },
  { id: "low-back", nameKey: "z5", noteKey: "z5_note", view: "back", top: "42%", left: "50%", severity: "ok", statusKey: "resolved", date: "05/01/2024" },
];

const colorMap = {
  alert: "bg-destructive",
  warn: "bg-warning",
  ok: "bg-success",
} as const;

function BodyPage() {
  const t = useT("body");
  const [view, setView] = useState<View>("front");
  const [selected, setSelected] = useState<Zone>(zones[0]);
  const visibleZones = zones.filter((z) => z.view === view);

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
                    active ? "bg-accent-foreground/20 text-accent-foreground" : "bg-destructive text-white"
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
        <div className="relative aspect-[3/5] w-full overflow-hidden rounded-xl bg-black">
          <img
            src={view === "front" ? bodyFront : bodyBack}
            alt={view === "front" ? t.front : t.back}
            className="h-full w-full object-contain"
          />
          {visibleZones.map((z) => {
            const active = selected.id === z.id;
            return (
              <button
                key={z.id}
                aria-label={t[z.nameKey]}
                onClick={() => setSelected(z)}
                style={{ top: z.top, left: z.left }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  active ? "ring-2 ring-white" : ""
                }`}
              >
                <span className={`flex size-6 items-center justify-center rounded-full ${colorMap[z.severity]}/25`}>
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
            <p className="text-display mt-1 text-lg font-semibold">{t[selected.nameKey]}</p>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {selected.date}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t[selected.noteKey]}</p>

        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {t.history}
          </p>
          <ul className="space-y-2 text-xs">
            {zones.map((z) => (
              <li key={z.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className={`size-1.5 rounded-full ${colorMap[z.severity]}`} />
                  {t[z.nameKey]}
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    {z.view === "front" ? t.f_short : t.b_short}
                  </span>
                </span>
                <span className="text-muted-foreground">{z.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
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
