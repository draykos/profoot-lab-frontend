import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Headphones, Wind, Moon } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/mental")({
  component: MentalPage,
  head: () => ({
    meta: [
      { title: "Mental coach — Profoot Lab" },
      { name: "description", content: "Sessioni di preparazione mentale, respirazione, recupero e concentrazione per calciatori." },
      { property: "og:title", content: "Mental coach — Profoot Lab" },
      { property: "og:description", content: "Preparazione mentale, respirazione e recupero per l'atleta." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kick-start-coach-39.lovable.app/mental" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://kick-start-coach-39.lovable.app/mental" },
    ],
  }),
});

function MentalPage() {
  const t = useT("mental");
  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      <Card className="mb-5 !p-5 bg-gradient-to-br from-accent/20 via-card to-card ring-inset ring-accent/30">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
              {t.coming}
            </p>
            <p className="text-display text-lg font-semibold">{t.coach}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{t.desc}</p>
      </Card>

      <h3 className="text-display mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t.preview}
      </h3>
      <div className="space-y-3">
        <Module icon={Wind} title={t.m1} sub={t.m1_sub} soon={t.soon} />
        <Module icon={Headphones} title={t.m2} sub={t.m2_sub} soon={t.soon} />
        <Module icon={Moon} title={t.m3} sub={t.m3_sub} soon={t.soon} />
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">{t.wip}</p>
    </AppShell>
  );
}

function Module({
  icon: Icon,
  title,
  sub,
  soon,
}: {
  icon: typeof Sparkles;
  title: string;
  sub: string;
  soon: string;
}) {
  return (
    <Card className="flex items-center gap-3 !p-4 opacity-70">
      <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-accent">
        <Icon className="size-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {soon}
      </span>
    </Card>
  );
}
