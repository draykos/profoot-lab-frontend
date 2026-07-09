import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/test")({
  component: TestPage,
  head: () => ({
    meta: [
      { title: "Test fisici — Sistema Atleta Pro" },
      { name: "description", content: "Risultati dei test di valutazione fisica con andamento storico." },
    ],
  }),
});

const history = [42.1, 43.8, 45.0, 44.2, 46.5, 47.1, 48.5];

function TestPage() {
  const max = Math.max(...history);
  return (
    <AppShell eyebrow="Performance" title="Test fisici">
      <Card className="mb-4 !p-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Squat Jump
            </span>
            <p className="text-display mt-1 text-3xl font-semibold text-accent">
              48,5<span className="ml-1 text-sm text-muted-foreground">cm</span>
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold uppercase text-success">
            <TrendingUp className="size-3" /> +12% vs prec.
          </span>
        </div>

        {/* Sparkline chart */}
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
          <span>Mar</span><span>Apr</span><span>Mag</span><span>Giu</span><span>Lug</span><span>Ago</span><span>Set</span>
        </div>
      </Card>

      <div className="space-y-3">
        <TestRow name="CMJ Jump" value="52,1 cm" delta="+3%" last="2 giorni fa" />
        <TestRow name="Sprint 20m" value="2,88 s" delta="-0,04s" last="5 giorni fa" positive />
        <TestRow name="Sprint 30m" value="4,12 s" delta="-0,02s" last="5 giorni fa" positive />
        <TestRow name="Yo-Yo IR1" value="2.240 m" delta="+80m" last="12 giorni fa" positive />
        <TestRow name="Illinois Test" value="15,4 s" delta="-0,3s" last="18 giorni fa" positive />
      </div>
    </AppShell>
  );
}

function TestRow({
  name,
  value,
  delta,
  last,
  positive,
}: {
  name: string;
  value: string;
  delta: string;
  last: string;
  positive?: boolean;
}) {
  return (
    <Card className="flex items-center justify-between !p-4">
      <div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-[11px] text-muted-foreground">Ultimo test · {last}</p>
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
