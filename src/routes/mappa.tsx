import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
import bodyFront from "@/assets/body-anatomy.jpg";
import bodyBack from "@/assets/body-anatomy-back.jpg";

export const Route = createFileRoute("/mappa")({
  component: MappaPage,
  head: () => ({
    meta: [
      { title: "Mappa corporea — Sistema Atleta Pro" },
      { name: "description", content: "Mappa anatomica frontale e posteriore con alert e storico infortuni." },
    ],
  }),
});

type View = "front" | "back";

type Zone = {
  id: string;
  name: string;
  view: View;
  top: string;
  left: string;
  severity: "alert" | "warn" | "ok";
  status: "In recupero" | "Attivo" | "Risolto";
  date: string;
  note: string;
};

const zones: Zone[] = [
  {
    id: "quad-l",
    name: "Flessore sinistro",
    view: "front",
    top: "58%",
    left: "42%",
    severity: "alert",
    status: "Attivo",
    date: "12 mar 2024",
    note: "Recidiva lieve. Evita carichi esplosivi per 5 giorni.",
  },
  {
    id: "ankle-r",
    name: "Caviglia destra",
    view: "front",
    top: "88%",
    left: "58%",
    severity: "warn",
    status: "In recupero",
    date: "04 feb 2024",
    note: "Distorsione grado I. Continua propriocezione.",
  },
  {
    id: "shoulder-r",
    name: "Spalla destra",
    view: "front",
    top: "22%",
    left: "62%",
    severity: "ok",
    status: "Risolto",
    date: "18 nov 2023",
    note: "Contusione risolta. Nessuna limitazione.",
  },
  {
    id: "hamstring-r",
    name: "Ischiocrurale destro",
    view: "back",
    top: "60%",
    left: "56%",
    severity: "warn",
    status: "In recupero",
    date: "20 feb 2024",
    note: "Stiramento grado I. Progressione carichi in corso.",
  },
  {
    id: "low-back",
    name: "Zona lombare",
    view: "back",
    top: "42%",
    left: "50%",
    severity: "ok",
    status: "Risolto",
    date: "05 gen 2024",
    note: "Contrattura risolta con terapia manuale.",
  },
];

const colorMap = {
  alert: "bg-destructive",
  warn: "bg-warning",
  ok: "bg-success",
} as const;

function MappaPage() {
  const [view, setView] = useState<View>("front");
  const [selected, setSelected] = useState<Zone>(zones[0]);
  const visibleZones = zones.filter((z) => z.view === view);

  return (
    <AppShell eyebrow="Stato muscolare" title="Mappa corporea">
      {/* Front / Back toggle */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-card p-1 ring-1 ring-inset ring-border">
        {(["front", "back"] as const).map((v) => {
          const active = v === view;
          const counts = zones.filter((z) => z.view === v && z.severity !== "ok").length;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center justify-center gap-2 rounded-full py-2 text-[11px] font-bold uppercase tracking-widest transition ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {v === "front" ? "Fronte" : "Retro"}
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
            alt={`Illustrazione anatomica del corpo — vista ${view === "front" ? "frontale" : "posteriore"}`}
            className="h-full w-full object-contain"
          />
          {visibleZones.map((z) => {
            const active = selected.id === z.id;
            return (
              <button
                key={z.id}
                aria-label={z.name}
                onClick={() => setSelected(z)}
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
          <Legend color="bg-destructive" label="Alert" />
          <Legend color="bg-warning" label="In recupero" />
          <Legend color="bg-success" label="Risolto" />
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
              {selected.status} • {selected.view === "front" ? "Fronte" : "Retro"}
            </p>
            <p className="text-display mt-1 text-lg font-semibold">{selected.name}</p>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {selected.date}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{selected.note}</p>

        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Storico infortuni
          </p>
          <ul className="space-y-2 text-xs">
            {zones.map((z) => (
              <li key={z.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className={`size-1.5 rounded-full ${colorMap[z.severity]}`} />
                  {z.name}
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    {z.view === "front" ? "F" : "R"}
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
