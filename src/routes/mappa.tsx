import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
import body from "@/assets/body-anatomy.jpg";

export const Route = createFileRoute("/mappa")({
  component: MappaPage,
  head: () => ({
    meta: [
      { title: "Mappa corporea — Sistema Atleta Pro" },
      { name: "description", content: "Mappa anatomica con alert e storico infortuni." },
    ],
  }),
});

type Zone = {
  id: string;
  name: string;
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
    top: "22%",
    left: "62%",
    severity: "ok",
    status: "Risolto",
    date: "18 nov 2023",
    note: "Contusione risolta. Nessuna limitazione.",
  },
];

const colorMap = {
  alert: "bg-destructive",
  warn: "bg-warning",
  ok: "bg-success",
} as const;

function MappaPage() {
  const [selected, setSelected] = useState<Zone>(zones[0]);

  return (
    <AppShell eyebrow="Stato muscolare" title="Mappa corporea">
      <Card className="mb-4 !p-3">
        <div className="relative aspect-[3/5] w-full overflow-hidden rounded-xl bg-black">
          <img
            src={body}
            alt="Illustrazione anatomica del corpo del calciatore"
            className="h-full w-full object-contain"
          />
          {zones.map((z) => {
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
              {selected.status}
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
