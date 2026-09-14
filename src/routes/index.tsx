import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
import { useLang, useT } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";
import { useAuth } from "@/lib/auth";
import { strapiInfortuni, strapiVideoCoach, type StrapiVideoCoach } from "@/lib/strapi";
import { pickHomeInjury, zoneLabel, STATO_TO_SEVERITY, type Severity } from "@/lib/infortuni";
import {
  categoriaLabel,
  dayLabel,
  featuredVideo,
  toModalVideo,
  videoThumbnail,
} from "@/lib/video-coach";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Dashboard — Profoot Lab" },
      {
        name: "description",
        content:
          "La tua dashboard: video del giorno, prossima partita e accesso rapido a training, dieta, test, mappa corporea e mental coach.",
      },
      { property: "og:title", content: "Dashboard — Profoot Lab" },
      {
        property: "og:description",
        content:
          "La tua giornata da calciatore: video del giorno, prossima partita e accesso rapido a tutte le sezioni.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
});

const alertStyle: Record<Severity, { border: string; bg: string; dot: string }> = {
  alert: { border: "border-l-destructive", bg: "bg-destructive/10", dot: "bg-destructive" },
  warn: { border: "border-l-warning", bg: "bg-warning/10", dot: "bg-warning" },
  ok: { border: "border-l-success", bg: "bg-success/10", dot: "bg-success" },
};

function HomePage() {
  const t = useT("home");
  const tb = useT("body");
  const tv = useT("videoCoach");
  const td = useT("train");
  const lang = useLang();
  const { jwt } = useAuth();
  const [openVideo, setOpenVideo] = useState<StrapiVideoCoach | null>(null);

  const { data } = useQuery({
    queryKey: ["infortuni", jwt],
    queryFn: () => strapiInfortuni(jwt as string),
    enabled: !!jwt,
  });

  const { data: videoCoachData } = useQuery({
    queryKey: ["video-coach", jwt],
    queryFn: () => strapiVideoCoach(jwt as string),
    enabled: !!jwt,
  });

  const locale = lang === "it" ? "it-IT" : "en-GB";
  const tvRecord = tv as unknown as Record<string, string>;
  const dayLabels = { today: td.today, yesterday: td.yesterday };
  const heroVideo = featuredVideo(videoCoachData?.data ?? []);

  const homeInjury = pickHomeInjury(data?.data ?? []);
  const homeInjuryLabel = homeInjury
    ? zoneLabel(tb as unknown as Record<string, string>, homeInjury.zona, homeInjury.lato)
    : null;
  const homeInjuryStatusLabel = homeInjury
    ? homeInjury.stato === "attivo"
      ? tb.active
      : homeInjury.stato === "in_recupero"
        ? tb.recovering
        : tb.resolved
    : null;
  const homeInjuryNote = homeInjury ? homeInjury.indicazioni || homeInjury.diagnosi || "" : null;
  const homeInjuryStyle = homeInjury ? alertStyle[STATO_TO_SEVERITY[homeInjury.stato]] : null;

  const activeAlertsCount = (data?.data ?? []).filter(
    (i) => STATO_TO_SEVERITY[i.stato] !== "ok",
  ).length;
  const qaBodySub =
    activeAlertsCount === 0
      ? t.qa_body_sub_none
      : activeAlertsCount === 1
        ? t.qa_body_sub_one
        : `${activeAlertsCount} ${t.qa_body_sub_many}`;

  const quickAccess = [
    { to: "/training", label: t.qa_train, icon: Dumbbell, sub: t.qa_train_sub },
    { to: "/diet", label: t.qa_diet, icon: Salad, sub: t.qa_diet_sub },
    { to: "/test", label: t.qa_tests, icon: Trophy, sub: t.qa_tests_sub },
    { to: "/body", label: t.qa_body, icon: HeartPulse, sub: qaBodySub },
    { to: "/matches", label: t.qa_matches, icon: CalendarDays, sub: t.qa_matches_sub },
    { to: "/video-coach", label: t.qa_mental, icon: Sparkles, sub: t.qa_mental_sub },
  ] as const;

  return (
    <AppShell eyebrow={t.hello} title={t.ready}>
      {/* Video del giorno */}
      {heroVideo && (
        <button
          type="button"
          className="mb-4 block w-full text-left"
          onClick={() => setOpenVideo(heroVideo)}
        >
          <Card className="!p-0 overflow-hidden ring-0">
            <div className="relative aspect-video w-full">
              <img
                src={videoThumbnail(heroVideo)}
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
                  {dayLabel(dayLabels, heroVideo.data, locale)}
                </p>
                <h2 className="text-display mt-1 text-xl font-semibold leading-tight text-white">
                  {heroVideo.titolo}
                </h2>
                <p className="mt-1 text-xs text-white/70">
                  {[
                    categoriaLabel(tvRecord, heroVideo.categoria),
                    heroVideo.durataMinuti ? `${heroVideo.durataMinuti} min` : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
            </div>
          </Card>
        </button>
      )}

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

      {/* Body alert strip — oldest attivo, else oldest in_recupero, else oldest risolto, else hidden */}
      {homeInjury && homeInjuryStyle && (
        <Link to="/body" className="mb-6 block">
          <Card
            className={`flex items-center gap-3 border-l-2 !p-3 ring-0 ${homeInjuryStyle.border} ${homeInjuryStyle.bg}`}
          >
            <span
              className={`size-2 shrink-0 animate-pulse-dot rounded-full ${homeInjuryStyle.dot}`}
            />
            <div className="flex-1">
              <p className="text-xs font-semibold">
                {homeInjuryStatusLabel} • {homeInjuryLabel}
              </p>
              {homeInjuryNote && (
                <p className="text-[10px] text-muted-foreground">{homeInjuryNote}</p>
              )}
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Card>
        </Link>
      )}

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
      <VideoPlayerModal
        video={openVideo ? toModalVideo(openVideo, tvRecord, dayLabels, locale) : null}
        onClose={() => setOpenVideo(null)}
        closeLabel={tv.close}
      />
    </AppShell>
  );
}
