import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/dieta")({
  component: DietaPage,
  head: () => ({
    meta: [
      { title: "Dieta — Sistema Atleta Pro" },
      { name: "description", content: "Piano alimentare della giornata con orari, alimenti e valori nutrizionali." },
    ],
  }),
});

const meals = [
  {
    time: "07:30",
    name: "Colazione",
    dish: "Porridge d'avena, mirtilli, mandorle",
    kcal: 520,
    macros: { c: 65, p: 20, f: 12 },
    active: true,
  },
  {
    time: "10:30",
    name: "Spuntino",
    dish: "Yogurt greco, miele e frutta secca",
    kcal: 280,
    macros: { c: 22, p: 18, f: 12 },
  },
  {
    time: "13:00",
    name: "Pranzo",
    dish: "Pasta integrale al salmone e spinaci",
    kcal: 720,
    macros: { c: 80, p: 35, f: 18 },
  },
  {
    time: "16:30",
    name: "Pre-allenamento",
    dish: "Banana, gallette di riso, burro d'arachidi",
    kcal: 340,
    macros: { c: 55, p: 8, f: 10 },
  },
  {
    time: "20:30",
    name: "Cena",
    dish: "Petto di pollo, quinoa, verdure grigliate",
    kcal: 590,
    macros: { c: 45, p: 48, f: 14 },
  },
];

const totalKcal = meals.reduce((a, m) => a + m.kcal, 0);

function DietaPage() {
  return (
    <AppShell eyebrow="Piano nutrizionale" title="Dieta">
      <Card className="mb-5 !p-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Fabbisogno oggi
            </span>
            <p className="text-display mt-1 text-3xl font-semibold">
              {totalKcal.toLocaleString("it-IT")}
              <span className="ml-1 text-sm text-muted-foreground">kcal</span>
            </p>
          </div>
          <div className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">
            Obiettivo <span className="text-accent">2.500</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          <Macro label="Carbo" value="267g" bar={0.75} />
          <Macro label="Proteine" value="129g" bar={0.9} />
          <Macro label="Grassi" value="66g" bar={0.6} />
        </div>
      </Card>

      <div className="relative space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border">
        {meals.map((m) => (
          <div key={m.time} className="relative pl-8">
            <span
              className={`absolute left-0 top-1.5 flex size-6 items-center justify-center rounded-full bg-card ring-1 ${
                m.active ? "ring-accent" : "ring-border"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${m.active ? "bg-accent" : "bg-muted-foreground"}`}
              />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {m.time} · {m.name}
            </p>
            <Card className="mt-2 !p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">{m.dish}</p>
                <span className="text-display shrink-0 text-sm font-semibold text-accent">
                  {m.kcal}
                  <span className="text-[10px] text-muted-foreground"> kcal</span>
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Carb {m.macros.c}g · Pro {m.macros.p}g · Grassi {m.macros.f}g
              </p>
            </Card>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function Macro({ label, value, bar }: { label: string; value: string; bar: number }) {
  return (
    <div>
      <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-accent" style={{ width: `${bar * 100}%` }} />
      </div>
      <p className="text-sm font-semibold text-foreground normal-case tracking-normal">{value}</p>
      <p>{label}</p>
    </div>
  );
}
