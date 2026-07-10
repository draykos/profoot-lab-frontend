import { createFileRoute } from "@tanstack/react-router";
import { Play, Calendar } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/training")({
  component: TrainingPage,
  head: () => ({
    meta: [
      { title: "Allenamento — Pitch Perfect" },
      { name: "description", content: "Un video di allenamento al giorno per l'ultima settimana, con sessioni tecniche, tattiche e fisiche per calciatori." },
      { property: "og:title", content: "Allenamento — Pitch Perfect" },
      { property: "og:description", content: "Sessioni video giornaliere per migliorare tecnica, tattica e fisicità in campo." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kick-start-coach-39.lovable.app/training" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://kick-start-coach-39.lovable.app/training" },
    ],
  }),
});

type Intensity = "high" | "med" | "low";

type DailyVideo = {
  dayKey: "d_mar" | "d_lun" | "d_dom" | "d_sab" | "d_ven" | "d_gio" | "d_mer";
  dayNum: string;
  dateLabel: string; // may be a translated key marker or literal
  titleKey: "v1_title" | "v2_title" | "v3_title" | "v4_title" | "v5_title" | "v6_title" | "v7_title";
  tagKey: "v1_tag" | "v2_tag" | "v3_tag" | "v4_tag" | "v5_tag" | "v6_tag" | "v7_tag";
  duration: string;
  intensity: Intensity;
  thumb: string;
  isToday?: boolean;
};

const week: DailyVideo[] = [
  {
    dayKey: "d_mar",
    dayNum: "12",
    dateLabel: "__today__",
    titleKey: "v1_title",
    tagKey: "v1_tag",
    duration: "12 min",
    intensity: "high",
    thumb:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=60",
    isToday: true,
  },
  {
    dayKey: "d_lun",
    dayNum: "11",
    dateLabel: "__yesterday__",
    titleKey: "v2_title",
    tagKey: "v2_tag",
    duration: "10 min",
    intensity: "low",
    thumb:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=60",
  },
  {
    dayKey: "d_dom",
    dayNum: "10",
    dateLabel: "10/03",
    titleKey: "v3_title",
    tagKey: "v3_tag",
    duration: "20 min",
    intensity: "low",
    thumb:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=60",
  },
  {
    dayKey: "d_sab",
    dayNum: "09",
    dateLabel: "09/03",
    titleKey: "v4_title",
    tagKey: "v4_tag",
    duration: "25 min",
    intensity: "high",
    thumb:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=60",
  },
  {
    dayKey: "d_ven",
    dayNum: "08",
    dateLabel: "08/03",
    titleKey: "v5_title",
    tagKey: "v5_tag",
    duration: "15 min",
    intensity: "med",
    thumb:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=60",
  },
  {
    dayKey: "d_gio",
    dayNum: "07",
    dateLabel: "07/03",
    titleKey: "v6_title",
    tagKey: "v6_tag",
    duration: "22 min",
    intensity: "high",
    thumb:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=60",
  },
  {
    dayKey: "d_mer",
    dayNum: "06",
    dateLabel: "06/03",
    titleKey: "v7_title",
    tagKey: "v7_tag",
    duration: "8 min",
    intensity: "low",
    thumb:
      "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=800&q=60",
  },
];

const intensityColor: Record<Intensity, string> = {
  high: "text-destructive",
  med: "text-warning",
  low: "text-success",
};

function TrainingPage() {
  const t = useT("train");
  const today = week[0];
  const rest = week.slice(1);

  const intensityLabel = (i: Intensity) =>
    i === "high" ? t.i_high : i === "med" ? t.i_med : t.i_low;

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      {/* Video di oggi in evidenza */}
      <button className="mb-5 block w-full text-left">
        <Card className="!p-0 overflow-hidden ring-0">
          <div className="relative aspect-video w-full">
            <img
              src={today.thumb}
              alt={t[today.titleKey]}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
              {t.video_today}
            </span>
            <span className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow">
              <Play className="size-5 fill-current" />
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                {t[today.tagKey]} • {today.duration}
              </p>
              <p className="text-display mt-1 text-lg font-semibold text-white">
                {t[today.titleKey]}
              </p>
            </div>
          </div>
        </Card>
      </button>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t.previous_days}
        </h3>
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Calendar className="size-3" /> {t.seven_days}
        </span>
      </div>

      <div className="space-y-3">
        {rest.map((v) => (
          <button key={v.dayNum} className="w-full text-left">
            <Card className="!p-3">
              <div className="flex gap-3">
                <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary py-2 text-muted-foreground">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                    {t[v.dayKey]}
                  </span>
                  <span className="text-display text-lg font-semibold text-foreground">
                    {v.dayNum}
                  </span>
                </div>
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  <img src={v.thumb} alt="" loading="lazy" className="size-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="size-5 fill-white text-white" />
                  </span>
                </div>
                <div className="flex-1 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                    {t[v.tagKey]}
                  </span>
                  <p className="mt-1 text-sm font-semibold leading-snug">{t[v.titleKey]}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {v.duration} •{" "}
                    <span className={intensityColor[v.intensity]}>
                      {t.intensity} {intensityLabel(v.intensity)}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
