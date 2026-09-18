import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Loader2, Play, Sparkles } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useLang, useT } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";
import { useAuth } from "@/lib/auth";
import { strapiVideoCoach, type StrapiVideoCoach } from "@/lib/strapi";
import {
  categoriaLabel,
  dayLabel,
  featuredVideo,
  toModalVideo,
  videoThumbnail,
  visibleVideos,
} from "@/lib/video-coach";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";

export const Route = createFileRoute("/training")({
  component: TrainingPage,
  head: () => ({
    meta: [
      { title: "Allenamento — Profoot Lab" },
      {
        name: "description",
        content:
          "Un video di allenamento al giorno per l'ultima settimana, con sessioni tecniche, tattiche e fisiche per calciatori.",
      },
      { property: "og:title", content: "Allenamento — Profoot Lab" },
      {
        property: "og:description",
        content: "Sessioni video giornaliere per migliorare tecnica, tattica e fisicità in campo.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/training") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/training") }],
  }),
});

const DAY_KEYS = ["d_dom", "d_lun", "d_mar", "d_mer", "d_gio", "d_ven", "d_sab"] as const;

function dayBadge(t: Record<string, string>, dataISO: string): { top: string; num: string } {
  const date = new Date(`${dataISO}T00:00:00`);
  return { top: t[DAY_KEYS[date.getDay()]], num: String(date.getDate()).padStart(2, "0") };
}

function TrainingPage() {
  const t = useT("train");
  const tv = useT("videoCoach");
  const lang = useLang();
  const { jwt } = useAuth();
  const [openVideo, setOpenVideo] = useState<StrapiVideoCoach | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["video-coach", jwt],
    queryFn: () => strapiVideoCoach(jwt as string),
    enabled: !!jwt,
  });

  const locale = lang === "it" ? "it-IT" : "en-GB";
  const tRecord = t as unknown as Record<string, string>;
  const tvRecord = tv as unknown as Record<string, string>;
  const dayLabels = { today: t.today, yesterday: t.yesterday };

  const visible = visibleVideos(data?.data ?? []);
  const hero = featuredVideo(data?.data ?? []);
  const rest = visible.slice(1);

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      {isPending && (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && <p className="py-6 text-center text-sm text-muted-foreground">{tv.load_error}</p>}

      {!isPending && !isError && !hero && (
        <Card className="flex flex-col items-center gap-2 !p-6 text-center">
          <Sparkles className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">{tv.empty}</p>
        </Card>
      )}

      {hero && (
        <button
          type="button"
          className="mb-5 block w-full cursor-pointer text-left"
          onClick={() => setOpenVideo(hero)}
        >
          <Card className="!p-0 overflow-hidden ring-0">
            <div className="relative aspect-video w-full">
              <img
                src={videoThumbnail(hero)}
                alt={hero.titolo}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
                {dayLabel(dayLabels, hero.data, locale)}
              </span>
              <span className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow">
                <Play className="size-5 fill-current" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                  {[
                    categoriaLabel(tvRecord, hero.categoria),
                    hero.durataMinuti ? `${hero.durataMinuti} min` : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
                <p className="text-display mt-1 text-lg font-semibold text-white">{hero.titolo}</p>
              </div>
            </div>
          </Card>
        </button>
      )}

      {rest.length > 0 && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t.previous_days}
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Calendar className="size-3" /> {t.seven_days}
            </span>
          </div>
          <div className="space-y-3">
            {rest.map((v) => {
              const badge = dayBadge(tRecord, v.data);
              const cat = categoriaLabel(tvRecord, v.categoria);
              return (
                <button
                  key={v.id}
                  type="button"
                  className="w-full cursor-pointer text-left"
                  onClick={() => setOpenVideo(v)}
                >
                  <Card className="!p-3">
                    <div className="flex gap-3">
                      <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary py-2 text-muted-foreground">
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                          {badge.top}
                        </span>
                        <span className="text-display text-lg font-semibold text-foreground">
                          {badge.num}
                        </span>
                      </div>
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                        <img
                          src={videoThumbnail(v)}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="size-5 fill-white text-white" />
                        </span>
                      </div>
                      <div className="flex-1 py-1">
                        {cat && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                            {cat}
                          </span>
                        )}
                        <p className="mt-1 text-sm font-semibold leading-snug">{v.titolo}</p>
                        {v.durataMinuti != null && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {v.durataMinuti} min
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>
        </>
      )}

      <VideoPlayerModal
        video={openVideo ? toModalVideo(openVideo, tvRecord, dayLabels, locale) : null}
        onClose={() => setOpenVideo(null)}
        closeLabel={tv.close}
      />
    </AppShell>
  );
}
