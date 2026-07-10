import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/partite")({
  component: PartitePage,
  head: () => ({
    meta: [
      { title: "Partite — Sistema Atleta Pro" },
      { name: "description", content: "Calendario delle partite e prossimo incontro in evidenza." },
    ],
  }),
});

type Match = {
  home: string;
  away: string;
  dateIt: string;
  dateEn: string;
  time: string;
  venue: string;
  compIt: string;
  compEn: string;
};

const upcoming: Match[] = [
  { home: "Milano FC", away: "Torino", dateIt: "20 mar", dateEn: "Mar 20", time: "20:45", venue: "San Siro", compIt: "Serie A", compEn: "Serie A" },
  { home: "Napoli", away: "Milano FC", dateIt: "24 mar", dateEn: "Mar 24", time: "18:00", venue: "Maradona", compIt: "Serie A", compEn: "Serie A" },
  { home: "Milano FC", away: "PSG", dateIt: "02 apr", dateEn: "Apr 2", time: "21:00", venue: "San Siro", compIt: "Champions", compEn: "Champions" },
  { home: "Bologna", away: "Milano FC", dateIt: "07 apr", dateEn: "Apr 7", time: "15:00", venue: "Dall'Ara", compIt: "Serie A", compEn: "Serie A" },
];

function PartitePage() {
  const t = useT("matches");
  const lang = useLang();
  const [next, ...rest] = upcoming;
  const d = (m: Match) => (lang === "it" ? m.dateIt : m.dateEn);
  const c = (m: Match) => (lang === "it" ? m.compIt : m.compEn);

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      <Card className="mb-5 !p-5 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground ring-0">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
          {t.next}
        </span>
        <div className="mt-3 flex items-center justify-between">
          <TeamBadge name={next.home} />
          <div className="text-center">
            <p className="text-display text-3xl font-semibold">VS</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-70">
              {c(next)}
            </p>
          </div>
          <TeamBadge name={next.away} />
        </div>
        <div className="mt-5 flex items-center justify-between text-xs font-medium opacity-90">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" /> {d(next)} · {next.time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {next.venue}
          </span>
        </div>
      </Card>

      <h3 className="text-display mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t.scheduled}
      </h3>
      <div className="space-y-3">
        {rest.map((m, i) => (
          <Card key={i} className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                  {c(m)}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {m.home} <span className="text-muted-foreground">{t.vs}</span> {m.away}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{m.venue}</p>
              </div>
              <div className="text-right">
                <p className="text-display text-lg font-semibold">{d(m)}</p>
                <p className="text-[11px] text-muted-foreground">{m.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

function TeamBadge({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-display flex size-14 items-center justify-center rounded-full bg-accent-foreground text-accent text-lg font-bold">
        {initials}
      </div>
      <p className="max-w-[70px] text-center text-[11px] font-semibold leading-tight">{name}</p>
    </div>
  );
}
