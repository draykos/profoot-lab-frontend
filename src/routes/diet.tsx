import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Salad } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { useLang, useT } from "@/lib/i18n";
import {
  TIPO_KEY,
  currentPiano,
  formatOrario,
  macroEnergyShares,
  nextPastoIndex,
  pianoTotals,
  sortedPasti,
} from "@/lib/piano-alimentare";
import { absoluteUrl } from "@/lib/site";
import { strapiPianoAlimentare } from "@/lib/strapi";

export const Route = createFileRoute("/diet")({
  component: DietPage,
  head: () => ({
    meta: [
      { title: "Dieta — Profoot Lab" },
      {
        name: "description",
        content:
          "Piano alimentare giornaliero per calciatori: orari, pasti, calorie e macro per ogni allenamento e partita.",
      },
      { property: "og:title", content: "Dieta — Profoot Lab" },
      {
        property: "og:description",
        content: "Piano alimentare su misura per l'atleta: orari, alimenti e valori nutrizionali.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/diet") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/diet") }],
  }),
});

function DietPage() {
  const t = useT("diet");
  const lang = useLang();
  const { jwt } = useAuth();

  const { data, isPending, isError } = useQuery({
    queryKey: ["piano-alimentare", jwt],
    queryFn: () => strapiPianoAlimentare(jwt as string),
    enabled: !!jwt,
  });

  const locale = lang === "it" ? "it-IT" : "en-US";
  const piano = currentPiano(data?.data ?? []);
  const pasti = piano ? sortedPasti(piano) : [];
  const totals = pianoTotals(pasti);
  const shares = macroEnergyShares(totals);
  const activeIndex = nextPastoIndex(pasti);

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      {isPending && (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && <p className="py-6 text-center text-sm text-muted-foreground">{t.load_error}</p>}

      {!isPending && !isError && pasti.length === 0 && (
        <Card className="flex flex-col items-center gap-2 !p-6 text-center">
          <Salad className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">{t.empty}</p>
        </Card>
      )}

      {pasti.length > 0 && (
        <>
          <Card className="mb-5 !p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t.today_need}
            </span>
            <p className="text-display mt-1 text-3xl font-semibold">
              {totals.kcal.toLocaleString(locale)}
              <span className="ml-1 text-sm text-muted-foreground">{t.kcal}</span>
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              <Macro label={t.carbs} value={`${totals.carboidratiG}g`} bar={shares.c} />
              <Macro label={t.protein} value={`${totals.proteineG}g`} bar={shares.p} />
              <Macro label={t.fats} value={`${totals.grassiG}g`} bar={shares.f} />
            </div>
          </Card>

          {piano?.note && (
            <Card className="mb-5 !p-4 text-sm text-muted-foreground">{piano.note}</Card>
          )}

          <div className="relative space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border">
            {pasti.map((m, i) => {
              const active = i === activeIndex;
              return (
                <div key={m.id} className="relative pl-8">
                  <span
                    className={`absolute left-0 top-1.5 flex size-6 items-center justify-center rounded-full bg-card ring-1 ${
                      active ? "ring-accent" : "ring-border"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${active ? "bg-accent" : "bg-muted-foreground"}`}
                    />
                  </span>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {formatOrario(m.orario)} · {t[TIPO_KEY[m.tipo]]}
                  </p>
                  <Card className="mt-2 !p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="whitespace-pre-line text-sm font-semibold">{m.descrizione}</p>
                      <span className="text-display shrink-0 text-sm font-semibold text-accent">
                        {m.kcal}
                        <span className="text-[10px] text-muted-foreground"> {t.kcal}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t.m_carb} {m.carboidratiG ?? 0}g · {t.m_pro} {m.proteineG ?? 0}g · {t.m_fat}{" "}
                      {m.grassiG ?? 0}g
                    </p>
                  </Card>
                </div>
              );
            })}
          </div>
        </>
      )}
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
