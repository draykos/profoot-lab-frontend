import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Dumbbell,
  HeartPulse,
  Salad,
  Sparkles,
  Trophy,
  Video,
} from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Dashboard — Sistema Atleta Pro" },
      {
        name: "description",
        content:
          "La tua giornata: allenamento di oggi, prossima partita e accesso rapido a tutte le sezioni.",
      },
    ],
  }),
});

const quickAccess = [
  { to: "/allenamento", label: "Allenamento", icon: Dumbbell, sub: "Sessione di oggi" },
  { to: "/dieta", label: "Dieta", icon: Salad, sub: "5 pasti • 2.450 kcal" },
  { to: "/test", label: "Test Fisici", icon: Trophy, sub: "Storico prestazioni" },
  { to: "/mappa", label: "Mappa Corporea", icon: HeartPulse, sub: "2 alert attivi" },
  { to: "/partite", label: "Partite", icon: CalendarDays, sub: "Prossime & storico" },
  { to: "/mental", label: "Mental Coach", icon: Sparkles, sub: "Nuovo modulo" },
] as const;

function HomePage() {
  return (
    <AppShell
      eyebrow="Ciao, Luca"
      title="Pronto per oggi?"
      action={
        <button
          aria-label="Notifiche"
          className="relative flex size-11 items-center justify-center rounded-full border border-border bg-card"
        >
          <Bell className="size-4" />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-accent" />
        </button>
      }
    >
      {/* Today card */}
      <Card className="mb-4 bg-gradient-to-br from-accent to-accent/70 !p-5 ring-0 text-accent-foreground">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
            Oggi • Martedì
          </span>
          <span className="rounded-full bg-accent-foreground/10 px-2 py-0.5 text-[10px] font-bold uppercase">
            Sessione 1/2
          </span>
        </div>
        <h2 className="text-display mt-2 text-2xl font-semibold leading-tight">
          Lavoro di forza esplosiva
        </h2>
        <p className="mt-1 text-sm opacity-80">4 esercizi • 45 min • Palestra</p>
        <Link
          to="/allenamento"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-foreground/90 px-4 py-2 text-xs font-semibold text-accent"
        >
          <Video className="size-3.5" /> Guarda i video
        </Link>
      </Card>

      {/* Next match */}
      <Card className="mb-4 flex items-center justify-between !p-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Prossima partita
          </span>
          <p className="text-display mt-1 text-lg font-semibold">Milano FC vs Roma</p>
          <p className="text-xs text-muted-foreground">Domenica • 15:30 • San Siro</p>
        </div>
        <Link
          to="/partite"
          className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground"
        >
          <ArrowRight className="size-4" />
        </Link>
      </Card>

      {/* Body alert strip */}
      <Link to="/mappa" className="mb-6 block">
        <Card className="flex items-center gap-3 border-l-2 border-l-destructive !p-3 ring-0 bg-destructive/10">
          <span className="size-2 shrink-0 animate-pulse-dot rounded-full bg-destructive" />
          <div className="flex-1">
            <p className="text-xs font-semibold">Alert corpo: Flessore sinistro</p>
            <p className="text-[10px] text-muted-foreground">
              Recidiva lieve • Evita carichi esplosivi
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
        </Card>
      </Link>

      {/* Quick access */}
      <h3 className="text-display mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Sezioni
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {quickAccess.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.to} to={s.to}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:ring-accent/40">
                <div className="mb-6 flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="size-5" />
                </div>
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
