import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/highlights")({
  component: HighlightsPage,
  head: () => ({
    meta: [
      { title: "Highlights — Sistema Atleta Pro" },
      { name: "description", content: "Le tue clip migliori dalle partite." },
    ],
  }),
});

const clips = [
  { title: "Gol di destro vs Roma", meta: "18 feb · 0:24", cover: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=60" },
  { title: "Assist tacco vs Lazio", meta: "10 feb · 0:15", cover: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=600&q=60" },
  { title: "Recupero difensivo", meta: "03 feb · 0:11", cover: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=600&q=60" },
  { title: "Doppietta vs Inter", meta: "28 gen · 0:38", cover: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=600&q=60" },
];

function HighlightsPage() {
  return (
    <AppShell eyebrow="La tua stagione" title="Highlights">
      <Card className="mb-5 relative overflow-hidden !p-0 ring-0">
        <img
          src={clips[0].cover}
          alt=""
          className="aspect-video w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
            Top clip
          </span>
          <p className="text-display mt-1 text-lg font-semibold text-white">{clips[0].title}</p>
          <p className="text-[11px] text-white/70">{clips[0].meta}</p>
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
                <p className="text-xs font-semibold leading-tight">{c.title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{c.meta}</p>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
