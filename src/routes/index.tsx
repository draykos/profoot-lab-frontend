import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Dumbbell,
  HeartPulse,
  Salad,
  Sparkles,
  Trophy,
  Video,
} from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Dashboard — Profoot Lab" },
      { name: "description", content: "La tua dashboard: video del giorno, prossima partita e accesso rapido a training, dieta, test, mappa corporea e mental coach." },
      { property: "og:title", content: "Dashboard — Profoot Lab" },
      { property: "og:description", content: "La tua giornata da calciatore: video del giorno, prossima partita e accesso rapido a tutte le sezioni." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kick-start-coach-39.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://kick-start-coach-39.lovable.app/" },
    ],
  }),
});

function HomePage() {
  const t = useT("home");

  const quickAccess = [
    { to: "/training", label: t.qa_train, icon: Dumbbell, sub: t.qa_train_sub },
    { to: "/diet", label: t.qa_diet, icon: Salad, sub: t.qa_diet_sub },
    { to: "/test", label: t.qa_tests, icon: Trophy, sub: t.qa_tests_sub },
    { to: "/body", label: t.qa_body, icon: HeartPulse, sub: t.qa_body_sub },
    { to: "/matches", label: t.qa_matches, icon: CalendarDays, sub: t.qa_matches_sub },
    { to: "/mental", label: t.qa_mental, icon: Sparkles, sub: t.qa_mental_sub },
  ] as const;

  return (
    <AppShell eyebrow={t.hello} title={t.ready}>
      {/* Video del giorno */}
      <Link to="/training" className="mb-4 block">
        <Card className="!p-0 overflow-hidden ring-0">
          <div className="relative aspect-video w-full">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=70"
              alt={t.video_of_day}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
              {t.video_of_day}
            </span>
            <span className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow">
              <Video className="size-5" />
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                {t.today_tuesday}
              </p>
              <h2 className="text-display mt-1 text-xl font-semibold leading-tight text-white">
                {t.squat_title}
              </h2>
              <p className="mt-1 text-xs text-white/70">{t.squat_sub}</p>
            </div>
          </div>
        </Card>
      </Link>

      {/* Next match */}
      <Card className="mb-4 flex items-center justify-between !p-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t.next_match}
          </span>
          <p className="text-display mt-1 text-lg font-semibold">{t.match_teams}</p>
          <p className="text-xs text-muted-foreground">{t.match_when}</p>
        </div>
        <Link
          to="/matches"
          className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground"
        >
          <ArrowRight className="size-4" />
        </Link>
      </Card>

      {/* Body alert strip */}
      <Link to="/body" className="mb-6 block">
        <Card className="flex items-center gap-3 border-l-2 border-l-destructive !p-3 ring-0 bg-destructive/10">
          <span className="size-2 shrink-0 animate-pulse-dot rounded-full bg-destructive" />
          <div className="flex-1">
            <p className="text-xs font-semibold">{t.body_alert_title}</p>
            <p className="text-[10px] text-muted-foreground">{t.body_alert_sub}</p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
        </Card>
      </Link>

      {/* Quick access */}
      <h3 className="text-display mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {t.sections}
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
