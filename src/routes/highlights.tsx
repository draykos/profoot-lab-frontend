import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useLang, useT } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/highlights")({
  component: HighlightsPage,
  head: () => ({
    meta: [
      { title: "Highlights — Profoot Lab" },
      { name: "description", content: "Le tue clip migliori dalle partite: gol, assist e azioni decisive da rivedere e condividere." },
      { property: "og:title", content: "Highlights — Profoot Lab" },
      { property: "og:description", content: "Le tue clip migliori dalle partite." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/highlights") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: absoluteUrl("/highlights") },
    ],
  }),
});

type ClipKey = "c1" | "c2" | "c3" | "c4";

type Clip = { titleKey: ClipKey; dateIt: string; dateEn: string; dur: string; cover: string };

const clips: Clip[] = [
  { titleKey: "c1", dateIt: "18 feb", dateEn: "Feb 18", dur: "0:24", cover: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=60" },
  { titleKey: "c2", dateIt: "10 feb", dateEn: "Feb 10", dur: "0:15", cover: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=600&q=60" },
  { titleKey: "c3", dateIt: "03 feb", dateEn: "Feb 3", dur: "0:11", cover: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=600&q=60" },
  { titleKey: "c4", dateIt: "28 gen", dateEn: "Jan 28", dur: "0:38", cover: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=600&q=60" },
];

function HighlightsPage() {
  const t = useT("highlights");
  const lang = useLang();
  const meta = (c: Clip) => `${lang === "it" ? c.dateIt : c.dateEn} · ${c.dur}`;
  const top = clips[0];

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      <Card className="mb-5 relative overflow-hidden !p-0 ring-0">
        <img src={top.cover} alt="" className="aspect-video w-full object-cover opacity-80" />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
            {t.top}
          </span>
          <p className="text-display mt-1 text-lg font-semibold text-white">{t[top.titleKey]}</p>
          <p className="text-[11px] text-white/70">{meta(top)}</p>
        </div>
        <span className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Play className="size-5 fill-current" />
        </span>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {clips.slice(1).map((c, i) => (
          <button key={i} className="text-left">
            <Card className="!p-0 overflow-hidden ring-0">
              <div className="relative aspect-square overflow-hidden">
                <img src={c.cover} alt="" loading="lazy" className="size-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="size-6 fill-white text-white" />
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold leading-tight">{t[c.titleKey]}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{meta(c)}</p>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
