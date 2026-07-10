import { createFileRoute } from "@tanstack/react-router";
import { Play, Calendar } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/allenamento")({
  component: AllenamentoPage,
  head: () => ({
    meta: [
      { title: "Allenamento — Sistema Atleta Pro" },
      {
        name: "description",
        content: "Un video di allenamento al giorno per l'ultima settimana, caricato dallo staff.",
      },
    ],
  }),
});

type DailyVideo = {
  day: string;
  dayNum: string;
  date: string;
  title: string;
  tag: string;
  duration: string;
  intensity: "Bassa" | "Media" | "Alta";
  thumb: string;
  isToday?: boolean;
};

const week: DailyVideo[] = [
  {
    day: "MAR",
    dayNum: "12",
    date: "Oggi",
    title: "Squat esplosivi 4×6",
    tag: "Forza",
    duration: "12 min",
    intensity: "Alta",
    thumb:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=60",
    isToday: true,
  },
  {
    day: "LUN",
    dayNum: "11",
    date: "Ieri",
    title: "Mobilità dinamica",
    tag: "Attivazione",
    duration: "10 min",
    intensity: "Bassa",
    thumb:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=60",
  },
  {
    day: "DOM",
    dayNum: "10",
    date: "10 mar",
    title: "Recupero attivo",
    tag: "Defaticamento",
    duration: "20 min",
    intensity: "Bassa",
    thumb:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=60",
  },
  {
    day: "SAB",
    dayNum: "09",
    date: "09 mar",
    title: "Sprint & cambi di direzione",
    tag: "Velocità",
    duration: "25 min",
    intensity: "Alta",
    thumb:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=60",
  },
  {
    day: "VEN",
    dayNum: "08",
    date: "08 mar",
    title: "Stabilità anti-rotazione",
    tag: "Core",
    duration: "15 min",
    intensity: "Media",
    thumb:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=60",
  },
  {
    day: "GIO",
    dayNum: "07",
    date: "07 mar",
    title: "Circuito metabolico",
    tag: "Condizionamento",
    duration: "22 min",
    intensity: "Alta",
    thumb:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=60",
  },
  {
    day: "MER",
    dayNum: "06",
    date: "06 mar",
    title: "Foam roller & stretching",
    tag: "Recupero",
    duration: "8 min",
    intensity: "Bassa",
    thumb:
      "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=800&q=60",
  },
];

const intensityColor = {
  Alta: "text-destructive",
  Media: "text-warning",
  Bassa: "text-success",
} as const;

function AllenamentoPage() {
  const today = week[0];
  const rest = week.slice(1);

  return (
    <AppShell eyebrow="Ultima settimana" title="Allenamento">
      {/* Video di oggi in evidenza */}
      <button className="mb-5 block w-full text-left">
        <Card className="!p-0 overflow-hidden ring-0">
          <div className="relative aspect-video w-full">
            <img
              src={today.thumb}
              alt={today.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
              Video di oggi
            </span>
            <span className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow">
              <Play className="size-5 fill-current" />
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                {today.tag} • {today.duration}
              </p>
              <p className="text-display mt-1 text-lg font-semibold text-white">
                {today.title}
              </p>
            </div>
          </div>
        </Card>
      </button>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Giorni precedenti
        </h3>
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Calendar className="size-3" /> 7 giorni
        </span>
      </div>

      <div className="space-y-3">
        {rest.map((v) => (
          <button key={v.dayNum} className="w-full text-left">
            <Card className="!p-3">
              <div className="flex gap-3">
                <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary py-2 text-muted-foreground">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                    {v.day}
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
                    {v.tag}
                  </span>
                  <p className="mt-1 text-sm font-semibold leading-snug">{v.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {v.duration} •{" "}
                    <span className={intensityColor[v.intensity]}>
                      Intensità {v.intensity.toLowerCase()}
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
