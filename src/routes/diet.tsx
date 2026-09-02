import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/AppShell";
import { useLang, useT } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/diet")({
  component: DietPage,
  head: () => ({
    meta: [
      { title: "Dieta — Profoot Lab" },
      { name: "description", content: "Piano alimentare giornaliero per calciatori: orari, pasti, calorie e macro per ogni allenamento e partita." },
      { property: "og:title", content: "Dieta — Profoot Lab" },
      { property: "og:description", content: "Piano alimentare su misura per l'atleta: orari, alimenti e valori nutrizionali." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/diet") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: absoluteUrl("/diet") },
    ],
  }),
});

type MealKey = "breakfast" | "snack" | "lunch" | "pre" | "dinner";
type DishKey = "dish1" | "dish2" | "dish3" | "dish4" | "dish5";

type Meal = {
  time: string;
  nameKey: MealKey;
  dishKey: DishKey;
  kcal: number;
  macros: { c: number; p: number; f: number };
  active?: boolean;
};

const meals: Meal[] = [
  { time: "07:30", nameKey: "breakfast", dishKey: "dish1", kcal: 520, macros: { c: 65, p: 20, f: 12 }, active: true },
  { time: "10:30", nameKey: "snack", dishKey: "dish2", kcal: 280, macros: { c: 22, p: 18, f: 12 } },
  { time: "13:00", nameKey: "lunch", dishKey: "dish3", kcal: 720, macros: { c: 80, p: 35, f: 18 } },
  { time: "16:30", nameKey: "pre", dishKey: "dish4", kcal: 340, macros: { c: 55, p: 8, f: 10 } },
  { time: "20:30", nameKey: "dinner", dishKey: "dish5", kcal: 590, macros: { c: 45, p: 48, f: 14 } },
];

const totalKcal = meals.reduce((a, m) => a + m.kcal, 0);

function DietPage() {
  const t = useT("diet");
  const lang = useLang();
  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      <Card className="mb-5 !p-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t.today_need}
            </span>
            <p className="text-display mt-1 text-3xl font-semibold">
              {totalKcal.toLocaleString(lang === "it" ? "it-IT" : "en-US")}
              <span className="ml-1 text-sm text-muted-foreground">{t.kcal}</span>
            </p>
          </div>
          <div className="text-right text-[10px] uppercase tracking-widest text-muted-foreground">
            {t.goal}{" "}
            <span className="text-accent">
              {(2500).toLocaleString(lang === "it" ? "it-IT" : "en-US")}
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          <Macro label={t.carbs} value="267g" bar={0.75} />
          <Macro label={t.protein} value="129g" bar={0.9} />
          <Macro label={t.fats} value="66g" bar={0.6} />
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
              {m.time} · {t[m.nameKey]}
            </p>
            <Card className="mt-2 !p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">{t[m.dishKey]}</p>
                <span className="text-display shrink-0 text-sm font-semibold text-accent">
                  {m.kcal}
                  <span className="text-[10px] text-muted-foreground"> {t.kcal}</span>
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t.m_carb} {m.macros.c}g · {t.m_pro} {m.macros.p}g · {t.m_fat} {m.macros.f}g
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
