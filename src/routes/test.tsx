import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Loader2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/lib/auth";
import { useLang, useT } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";
import { strapiTestFisici } from "@/lib/strapi";
import {
  TREND_MONTHS,
  decimalsFor,
  groupTests,
  isImprovement,
  startOfDay,
  trendStart,
  type TestGroup,
} from "@/lib/test-fisici";

export const Route = createFileRoute("/test")({
  component: TestPage,
  head: () => ({
    meta: [
      { title: "Test fisici — Profoot Lab" },
      {
        name: "description",
        content:
          "Risultati e andamento storico dei test di valutazione fisica per monitorare i progressi in campo.",
      },
      { property: "og:title", content: "Test fisici — Profoot Lab" },
      {
        property: "og:description",
        content: "Monitora i tuoi test fisici e il trend dei valori nel tempo.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/test") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/test") }],
  }),
});

function TestPage() {
  const t = useT("tests");
  const lang = useLang();
  const { jwt } = useAuth();
  const locale = lang === "it" ? "it-IT" : "en-GB";

  const { data, isPending, isError } = useQuery({
    queryKey: ["test-fisici", jwt],
    queryFn: () => strapiTestFisici(jwt as string),
    enabled: !!jwt,
  });

  const today = useMemo(() => startOfDay(new Date()), []);
  const groups = useMemo(() => groupTests(data?.data ?? [], today, locale), [data, today, locale]);

  // `undefined` = the user hasn't touched the accordion yet, so the first test starts open;
  // "" = the user collapsed the open item.
  const [openCode, setOpenCode] = useState<string | undefined>(undefined);
  const value = openCode ?? groups[0]?.tipo.codice ?? "";

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      {isPending && (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && <p className="py-6 text-center text-sm text-muted-foreground">{t.load_error}</p>}

      {!isPending && !isError && groups.length === 0 && (
        <Card className="flex flex-col items-center gap-2 !p-6 text-center">
          <Activity className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">{t.empty}</p>
        </Card>
      )}

      {!isPending && !isError && groups.length > 0 && (
        <Accordion
          type="single"
          collapsible
          value={value}
          onValueChange={setOpenCode}
          className="space-y-3"
        >
          {groups.map((g) => (
            <TestItem key={g.tipo.codice} group={g} today={today} locale={locale} />
          ))}
        </Accordion>
      )}
    </AppShell>
  );
}

function TestItem({ group, today, locale }: { group: TestGroup; today: Date; locale: string }) {
  const t = useT("tests");
  const { tipo, latest, previous, daysSinceLast } = group;
  const decimals = decimalsFor(tipo);
  const fmt = (v: number) =>
    v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  // Rounded to the displayed precision so a tiny float residue doesn't read as a change.
  const delta = previous ? Number((latest.valore - previous.valore).toFixed(decimals)) : null;
  const deltaClass =
    delta === null || delta === 0
      ? "text-muted-foreground"
      : isImprovement(tipo, delta)
        ? "text-success"
        : "text-destructive";
  const sign = delta === null ? "" : delta > 0 ? "+" : delta < 0 ? "−" : "±";

  const lastLabel =
    daysSinceLast === 0
      ? t.today
      : daysSinceLast === 1
        ? t.yesterday
        : `${daysSinceLast} ${t.days_ago}`;

  return (
    <AccordionItem
      value={tipo.codice}
      className="rounded-2xl border-b-0 bg-card px-4 ring-1 ring-inset ring-border"
    >
      <AccordionTrigger className="gap-3 py-4 hover:no-underline">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{tipo.nome}</p>
          <p className="text-[11px] font-normal text-muted-foreground">
            {t.last_test} · {lastLabel}
          </p>
        </div>
        <div className="text-right">
          <p className="text-display text-lg font-semibold">
            {fmt(latest.valore)}
            <span className="ml-1 text-xs text-muted-foreground">{tipo.unita}</span>
          </p>
          {delta !== null && (
            <p className={`text-[10px] font-bold ${deltaClass}`}>
              {sign}
              {fmt(Math.abs(delta))} {tipo.unita} {t.vs_prev}
            </p>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <TrendChart group={group} today={today} locale={locale} />
      </AccordionContent>
    </AccordionItem>
  );
}

const W = 280;
const H = 100;

function TrendChart({ group, today, locale }: { group: TestGroup; today: Date; locale: string }) {
  const gradientId = useId();
  const start = trendStart(today);
  const startMs = start.getTime();
  const endMs = today.getTime();
  const span = Math.max(endMs - startMs, 1);
  const points = group.points.filter((p) => p.date >= start && p.date <= today);

  const values = points.map((p) => p.valore);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const pad = rawMax === rawMin ? Math.abs(rawMax) * 0.05 || 1 : (rawMax - rawMin) * 0.15;
  const min = rawMin - pad;
  const max = rawMax + pad;

  const xy = points.map((p) => ({
    x: ((p.date.getTime() - startMs) / span) * W,
    y: 8 + (1 - (p.valore - min) / (max - min)) * (H - 16),
  }));
  const path = xy.length ? `M ${xy.map((p) => `${p.x},${p.y}`).join(" L ")}` : "";
  const area = xy.length ? `${path} L ${xy[xy.length - 1].x},${H} L ${xy[0].x},${H} Z` : "";

  // One label per month, centered on the visible part of that month.
  const months = Array.from({ length: TREND_MONTHS }, (_, i) => {
    const from = new Date(start.getFullYear(), start.getMonth() + i, 1).getTime();
    const to = Math.min(
      new Date(start.getFullYear(), start.getMonth() + i + 1, 1).getTime(),
      endMs,
    );
    return {
      key: from,
      label: new Date(from).toLocaleDateString(locale, { month: "short" }).replace(".", ""),
      left: (((from + to) / 2 - startMs) / span) * 100,
    };
  });

  return (
    <div className="border-t border-border pt-4">
      <div className="relative h-24">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {xy.length > 1 && (
            <>
              <path d={area} fill={`url(#${gradientId})`} />
              <path
                d={path}
                stroke="var(--accent)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>
        {/* Dots are HTML so they stay round despite the stretched SVG. */}
        {xy.map((p, i) => {
          const last = i === xy.length - 1;
          return (
            <span
              key={i}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
                last ? "size-2.5 bg-accent" : "size-1.5 bg-foreground/60"
              }`}
              style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
            />
          );
        })}
      </div>
      <div className="relative mt-2 h-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        {months.map((m) => (
          <span
            key={m.key}
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${m.left}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
