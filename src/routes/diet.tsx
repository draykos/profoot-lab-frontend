import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Loader2, Salad } from "lucide-react";
import { useRef, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { useLang, useT } from "@/lib/i18n";
import {
  DAYS_AHEAD,
  TIPO_KEY,
  formatKcal,
  formatOrario,
  macroEnergyShares,
  nextPastoIndex,
  pastiForDate,
  pianoForDate,
  pianoTotals,
  upcomingDays,
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

/** Minimum horizontal travel (px) for a touch gesture on the meal list to switch day. */
const SWIPE_THRESHOLD = 50;

function DietPage() {
  const t = useT("diet");
  const lang = useLang();
  const { jwt } = useAuth();
  const [dayIndex, setDayIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["piano-alimentare", jwt],
    queryFn: () => strapiPianoAlimentare(jwt as string),
    enabled: !!jwt,
  });

  const locale = lang === "it" ? "it-IT" : "en-US";
  const days = upcomingDays();
  const selectedDay = days[dayIndex];
  const piano = pianoForDate(data?.data ?? [], selectedDay);
  const pasti = piano ? pastiForDate(piano, selectedDay) : [];
  const totals = pianoTotals(pasti);
  const shares = macroEnergyShares(totals);
  // The "next meal" marker only makes sense for today.
  const activeIndex = dayIndex === 0 ? nextPastoIndex(pasti) : -1;

  /** "oggi" / "domani" / "ven 16" — lower-case, used inside sentences. */
  const dayName = (i: number) => {
    if (i === 0) return t.today;
    if (i === 1) return t.tomorrow;
    const d = days[i];
    return `${d.toLocaleDateString(locale, { weekday: "short" })} ${d.getDate()}`;
  };
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const goTo = (i: number) => setDayIndex(Math.min(Math.max(i, 0), DAYS_AHEAD - 1));

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Ignore mostly-vertical gestures: those are the user scrolling the list.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    goTo(dayIndex + (dx < 0 ? 1 : -1));
  };

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      <div className="mb-5 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const selected = i === dayIndex;
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => goTo(i)}
              aria-pressed={selected}
              className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 ring-1 transition-colors ${
                selected
                  ? "bg-accent text-accent-foreground ring-accent"
                  : "bg-card text-muted-foreground ring-border hover:text-foreground"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {i === 0 ? t.today : d.toLocaleDateString(locale, { weekday: "short" })}
              </span>
              <span
                className={`text-display text-base font-semibold ${selected ? "" : "text-foreground"}`}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {isPending && (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && <p className="py-6 text-center text-sm text-muted-foreground">{t.load_error}</p>}

      {!isPending && !isError && (
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {pasti.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 !p-6 text-center">
              <Salad className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">{piano ? t.empty_day : t.empty}</p>
            </Card>
          ) : (
            <>
              <Card className="mb-5 !p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t.need} {dayName(dayIndex)}
                </span>
                <p className="text-display mt-1 text-3xl font-semibold">
                  {formatKcal(totals.kcal, locale)}
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
                          <p className="whitespace-pre-line text-sm font-semibold">
                            {m.descrizione}
                          </p>
                          <span className="text-display shrink-0 text-sm font-semibold text-accent">
                            {m.kcal}
                            <span className="text-[10px] text-muted-foreground"> {t.kcal}</span>
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {t.m_carb} {m.carboidratiG ?? 0}g · {t.m_pro} {m.proteineG ?? 0}g ·{" "}
                          {t.m_fat} {m.grassiG ?? 0}g
                        </p>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
            {dayIndex > 0 ? (
              <button
                type="button"
                onClick={() => goTo(dayIndex - 1)}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <ChevronLeft className="size-4" /> {capitalize(dayName(dayIndex - 1))}
              </button>
            ) : (
              <span />
            )}
            {dayIndex < DAYS_AHEAD - 1 && (
              <button
                type="button"
                onClick={() => goTo(dayIndex + 1)}
                className="flex items-center gap-1 hover:text-foreground"
              >
                {capitalize(dayName(dayIndex + 1))} <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        </div>
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
