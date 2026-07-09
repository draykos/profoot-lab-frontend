import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Ruler, Weight, Cake } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/profilo")({
  component: ProfiloPage,
  head: () => ({
    meta: [
      { title: "Profilo — Sistema Atleta Pro" },
      { name: "description", content: "I tuoi dati anagrafici e antropometrici." },
    ],
  }),
});

function ProfiloPage() {
  const navigate = useNavigate();
  return (
    <AppShell eyebrow="Account" title="Profilo">
      <Card className="mb-5 flex items-center gap-4 !p-4">
        <div className="text-display flex size-16 items-center justify-center rounded-full bg-accent text-2xl font-semibold text-accent-foreground">
          LB
        </div>
        <div className="flex-1">
          <p className="text-display text-lg font-semibold">Luca Bianchi</p>
          <p className="text-xs text-muted-foreground">Attaccante • Milano FC</p>
          <span className="mt-1 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
            Pro Status
          </span>
        </div>
      </Card>

      <h3 className="text-display mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Anagrafica
      </h3>
      <Card className="mb-5 divide-y divide-border !p-0">
        <Field label="Nome" value="Luca" />
        <Field label="Cognome" value="Bianchi" />
        <Field label="Data di nascita" value="14 marzo 2001" icon={<Cake className="size-4" />} />
        <Field label="Altezza" value="184 cm" icon={<Ruler className="size-4" />} />
        <Field label="Peso" value="78,2 kg" icon={<Weight className="size-4" />} />
      </Card>

      <button
        onClick={() => {
          try {
            localStorage.removeItem("atleta_auth");
          } catch {}
          navigate({ to: "/login" });
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <LogOut className="size-4" /> Esci
      </button>
    </AppShell>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
