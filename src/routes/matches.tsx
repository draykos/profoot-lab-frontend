import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Loader2, MapPin } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { useLang, useT } from "@/lib/i18n";
import { COMPETIZIONE_KEY, formatMatchDate, formatMatchTime, upcomingPartite } from "@/lib/partite";
import { strapiCalendarioPartite, type StrapiPartita } from "@/lib/strapi";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/matches")({
  component: MatchesPage,
  head: () => ({
    meta: [
      { title: "Partite — Profoot Lab" },
      {
        name: "description",
        content:
          "Calendario partite, prossimo incontro in evidenza, avversari, orari e stadi della stagione.",
      },
      { property: "og:title", content: "Partite — Profoot Lab" },
      {
        property: "og:description",
        content: "Calendario delle partite e prossimo incontro in evidenza.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/matches") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/matches") }],
  }),
});

function MatchesPage() {
  const t = useT("matches");
  const lang = useLang();
  const { jwt } = useAuth();
  const locale = lang === "it" ? "it-IT" : "en-US";
  const tRecord = t as unknown as Record<string, string>;

  const { data, isPending, isError } = useQuery({
    queryKey: ["calendario-partite", jwt],
    queryFn: () => strapiCalendarioPartite(jwt as string),
    enabled: !!jwt,
  });

  const [next, ...rest] = upcomingPartite(data?.data ?? []);
  const c = (m: StrapiPartita) =>
    m.competizione ? tRecord[COMPETIZIONE_KEY[m.competizione]] : null;

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      {isPending && (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && <p className="py-6 text-center text-sm text-muted-foreground">{t.load_error}</p>}

      {!isPending && !isError && !next && (
        <Card className="flex flex-col items-center gap-2 !p-6 text-center">
          <CalendarDays className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">{t.empty}</p>
        </Card>
      )}

      {next && (
        <Card className="mb-5 !p-5 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground ring-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
            {t.next}
          </span>
          <div className="mt-3 flex items-center justify-between">
            <TeamBadge name={next.squadraCasa ?? "—"} />
            <div className="text-center">
              <p className="text-display text-3xl font-semibold">VS</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest opacity-70">
                {c(next)}
              </p>
            </div>
            <TeamBadge name={next.squadraTrasferta ?? "—"} />
          </div>
          <div className="mt-5 flex items-center justify-between text-xs font-medium opacity-90">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> {formatMatchDate(next.dataOra, locale)} ·{" "}
              {formatMatchTime(next.dataOra, locale)}
            </span>
            {next.stadio && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {next.stadio}
              </span>
            )}
          </div>
        </Card>
      )}

      {rest.length > 0 && (
        <>
          <h3 className="text-display mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t.scheduled}
          </h3>
          <div className="space-y-3">
            {rest.map((m) => (
              <Card key={m.id} className="!p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                      {c(m)}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {m.squadraCasa ?? "—"} <span className="text-muted-foreground">{t.vs}</span>{" "}
                      {m.squadraTrasferta ?? "—"}
                    </p>
                    {m.stadio && (
                      <p className="mt-1 text-[11px] text-muted-foreground">{m.stadio}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-display text-lg font-semibold">
                      {formatMatchDate(m.dataOra, locale)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatMatchTime(m.dataOra, locale)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
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
