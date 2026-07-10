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
      {/* Video del giorno */}
      <Link to="/allenamento" className="mb-4 block">
        <Card className="!p-0 overflow-hidden ring-0">
          <div className="relative aspect-video w-full">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=70"
              alt="Video del giorno"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
              Video del giorno
            </span>
            <span className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow">
              <Video className="size-5" />
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                Oggi • Martedì
              </p>
              <h2 className="text-display mt-1 text-xl font-semibold leading-tight text-white">
                Squat esplosivi 4×6
              </h2>
              <p className="mt-1 text-xs text-white/70">Forza • 12 min • con Coach Marco</p>
            </div>
          </div>
        </Card>
      </Link>


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
