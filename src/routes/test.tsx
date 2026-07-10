import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/test")({
  component: TestPage,
  head: () => ({
    meta: [
      { title: "Test fisici — Pitch Perfect" },
      { name: "description", content: "Risultati e andamento storico dei test di valutazione fisica per monitorare i progressi in campo." },
      { property: "og:title", content: "Test fisici — Pitch Perfect" },
      { property: "og:description", content: "Monitora i tuoi test fisici e il trend dei valori nel tempo." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kick-start-coach-39.lovable.app/test" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://kick-start-coach-39.lovable.app/test" },
    ],
  }),
});

const history = [42.1, 43.8, 45.0, 44.2, 46.5, 47.1, 48.5];
const monthsIt = ["Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set"];
const monthsEn = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

function TestPage() {
  const t = useT("tests");
  const lang = useLang();
  const months = lang === "it" ? monthsIt : monthsEn;
  const max = Math.max(...history);
  const jumpValue = lang === "it" ? "48,5" : "48.5";
  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      <Card className="mb-4 !p-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Squat Jump
            </span>
            <p className="text-display mt-1 text-3xl font-semibold text-accent">
              {jumpValue}
              <span className="ml-1 text-sm text-muted-foreground">cm</span>
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold uppercase text-success">
            <TrendingUp className="size-3" /> +12% {t.vs_prev}
          </span>
        </div>

        <div className="relative h-24">
          <svg viewBox="0 0 280 100" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const pts = history.map((v, i) => {
                const x = (i / (history.length - 1)) * 280;
                const y = 90 - (v / max) * 80;
                return `${x},${y}`;
              });
              const path = `M ${pts.join(" L ")}`;
              const area = `${path} L 280,100 L 0,100 Z`;
              return (
                <>
                  <path d={area} fill="url(#g1)" />
                  <path d={path} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  {history.map((v, i) => {
                    const x = (i / (history.length - 1)) * 280;
                    const y = 90 - (v / max) * 80;
                    const last = i === history.length - 1;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={last ? 4 : 2}
                        fill={last ? "var(--accent)" : "var(--foreground)"}
                        opacity={last ? 1 : 0.6}
                      />
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <TestRow name={t.row1} value={lang === "it" ? "52,1 cm" : "52.1 cm"} delta="+3%" lastDays={2} />
        <TestRow name={t.row2} value={lang === "it" ? "2,88 s" : "2.88 s"} delta={lang === "it" ? "-0,04s" : "-0.04s"} lastDays={5} positive />
        <TestRow name={t.row3} value={lang === "it" ? "4,12 s" : "4.12 s"} delta={lang === "it" ? "-0,02s" : "-0.02s"} lastDays={5} positive />
        <TestRow name={t.row4} value={lang === "it" ? "2.240 m" : "2,240 m"} delta="+80m" lastDays={12} positive />
        <TestRow name={t.row5} value={lang === "it" ? "15,4 s" : "15.4 s"} delta={lang === "it" ? "-0,3s" : "-0.3s"} lastDays={18} positive />
      </div>
    </AppShell>
  );
}

function TestRow({
  name,
  value,
  delta,
  lastDays,
  positive,
}: {
  name: string;
  value: string;
  delta: string;
  lastDays: number;
  positive?: boolean;
}) {
  const t = useT("tests");
  return (
    <Card className="flex items-center justify-between !p-4">
      <div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-[11px] text-muted-foreground">
          {t.last_test} · {lastDays} {t.days_ago}
        </p>
      </div>
      <div className="text-right">
        <p className="text-display text-lg font-semibold">{value}</p>
        <p className={`text-[10px] font-bold uppercase ${positive ? "text-success" : "text-accent"}`}>
          {delta}
        </p>
      </div>
    </Card>
  );
}
