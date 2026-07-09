import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Clock, Flame } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/allenamento")({
  component: AllenamentoPage,
  head: () => ({
    meta: [
      { title: "Allenamento — Sistema Atleta Pro" },
      {
        name: "description",
        content: "Piano settimanale con video degli esercizi da eseguire, aggiornato dallo staff.",
      },
    ],
  }),
});

const days = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"] as const;

const sessions = [
  {
    tag: "01 · Attivazione",
    title: "Mobilità dinamica",
    duration: "10 min",
    intensity: "Bassa",
    video:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=60",
  },
  {
    tag: "02 · Forza",
    title: "Squat esplosivi 4×6",
    duration: "20 min",
    intensity: "Alta",
    video:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=60",
  },
  {
    tag: "03 · Core",
    title: "Stabilità anti-rotazione",
    duration: "12 min",
    intensity: "Media",
    video:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=60",
  },
  {
    tag: "04 · Recupero",
    title: "Foam roller & stretching",
    duration: "8 min",
    intensity: "Bassa",
    video:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=60",
  },
];

function AllenamentoPage() {
  const [active, setActive] = useState(1); // MAR

  return (
    <AppShell eyebrow="Settimana 12" title="Allenamento">
      {/* Week tabs */}
      <div className="mb-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((d, i) => {
          const isActive = i === active;
          return (
            <button
              key={d}
              onClick={() => setActive(i)}
              className={`flex min-w-14 flex-col items-center rounded-2xl px-3 py-3 text-[10px] font-bold uppercase tracking-widest transition ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "bg-card text-muted-foreground ring-1 ring-inset ring-border"
              }`}
            >
              <span className="opacity-70">{d}</span>
              <span className="text-display mt-1 text-lg font-semibold">
                {String(10 + i).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="mb-4 !p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
              Sessione di oggi
            </span>
            <p className="text-display mt-1 text-lg font-semibold">Forza esplosiva</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> 45'
            </span>
            <span className="flex items-center gap-1">
              <Flame className="size-3.5 text-accent" /> Alta
            </span>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {sessions.map((s, i) => (
          <button key={i} className="w-full text-left">
            <Card className="!p-3">
              <div className="flex gap-3">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  <img
                    src={s.video}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="size-5 fill-white text-white" />
                  </span>
                </div>
                <div className="flex-1 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                    {s.tag}
                  </span>
                  <p className="mt-1 text-sm font-semibold">{s.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {s.duration} • Intensità {s.intensity.toLowerCase()}
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
