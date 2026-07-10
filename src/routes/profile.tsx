import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Ruler, Weight, Cake, Languages } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { useLanguage, useT } from "@/lib/i18n";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profilo — Sistema Atleta Pro" },
      { name: "description", content: "I tuoi dati anagrafici e antropometrici." },
    ],
  }),
});

function ProfilePage() {
  const navigate = useNavigate();
  const t = useT("profile");
  const { lang, setLang } = useLanguage();

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      <Card className="mb-5 flex items-center gap-4 !p-4">
        <div className="text-display flex size-16 items-center justify-center rounded-full bg-accent text-2xl font-semibold text-accent-foreground">
          LB
        </div>
        <div className="flex-1">
          <p className="text-display text-lg font-semibold">Luca Bianchi</p>
          <p className="text-xs text-muted-foreground">{t.role}</p>
          <span className="mt-1 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
            {t.pro}
          </span>
        </div>
      </Card>

      <h3 className="text-display mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t.details}
      </h3>
      <Card className="mb-5 divide-y divide-border !p-0">
        <Field label={t.name} value="Luca" />
        <Field label={t.surname} value="Bianchi" />
        <Field label={t.dob} value={t.dob_val} icon={<Cake className="size-4" />} />
        <Field label={t.height} value="184 cm" icon={<Ruler className="size-4" />} />
        <Field label={t.weight} value="78,2 kg" icon={<Weight className="size-4" />} />
      </Card>

      <h3 className="text-display mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t.language}
      </h3>
      <Card className="mb-5 flex items-center justify-between !p-4">
        <span className="flex items-center gap-2 text-sm">
          <Languages className="size-4 text-muted-foreground" />
          {t.language}
        </span>
        <div className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5 text-[11px] font-bold uppercase tracking-widest">
          {(["it", "en"] as const).map((l) => {
            const active = l === lang;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1 transition ${
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                {l === "it" ? "Italiano" : "English"}
              </button>
            );
          })}
        </div>
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
        <LogOut className="size-4" /> {t.logout}
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
