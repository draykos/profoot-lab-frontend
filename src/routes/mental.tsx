import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Headphones, Wind, Moon } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/mental")({
  component: MentalPage,
  head: () => ({
    meta: [
      { title: "Mental coach — Sistema Atleta Pro" },
      { name: "description", content: "Sessioni di preparazione mentale, respirazione e recupero." },
    ],
  }),
});

function MentalPage() {
  return (
    <AppShell eyebrow="Testa & Corpo" title="Mental coach">
      <Card className="mb-5 !p-5 bg-gradient-to-br from-accent/20 via-card to-card ring-inset ring-accent/30">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
              In arrivo
            </p>
            <p className="text-display text-lg font-semibold">Il tuo coach mentale</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Percorsi guidati di visualizzazione, respirazione e gestione dello stress pre-partita,
          costruiti insieme al tuo staff.
        </p>
      </Card>

      <h3 className="text-display mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Anteprima moduli
      </h3>
      <div className="space-y-3">
        <Module icon={Wind} title="Respirazione 4-7-8" sub="5 min · Pre-partita" />
        <Module icon={Headphones} title="Visualizzazione dell'azione" sub="8 min · Focus" />
        <Module icon={Moon} title="Recupero mentale notturno" sub="12 min · Sonno" />
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Sezione in fase di sviluppo — presto disponibile.
      </p>
    </AppShell>
  );
}

function Module({
  icon: Icon,
  title,
  sub,
}: {
  icon: typeof Sparkles;
  title: string;
  sub: string;
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
        Soon
      </span>
    </Card>
  );
}
