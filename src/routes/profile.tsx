import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Ruler, Weight, Cake, Languages, Hash, Footprints, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell, Card } from "@/components/AppShell";
import { useLanguage, useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { absoluteUrl } from "@/lib/site";
import { strapiAtleta, strapiMediaUrl, type AtletaPiede, type AtletaRuolo } from "@/lib/strapi";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profilo — Profoot Lab" },
      {
        name: "description",
        content:
          "I tuoi dati anagrafici, antropometrici, ruolo e preferenze lingua di Profoot Lab.",
      },
      { property: "og:title", content: "Profilo — Profoot Lab" },
      { property: "og:description", content: "Dati atleta, misure, ruolo e impostazioni lingua." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/profile") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/profile") }],
  }),
});

const RUOLO_KEY: Record<AtletaRuolo, string> = {
  portiere: "ruolo_portiere",
  difensore: "ruolo_difensore",
  centrocampista: "ruolo_centrocampista",
  attaccante: "ruolo_attaccante",
};

const PIEDE_KEY: Record<AtletaPiede, string> = {
  destro: "piede_destro",
  sinistro: "piede_sinistro",
  ambidestro: "piede_ambidestro",
};

function ProfilePage() {
  const navigate = useNavigate();
  const t = useT("profile");
  const { lang, setLang } = useLanguage();
  const { jwt, logout } = useAuth();

  const { data, isPending, isError } = useQuery({
    queryKey: ["atleta", jwt],
    queryFn: () => strapiAtleta(jwt as string),
    enabled: !!jwt,
  });

  const atleta = data?.data ?? null;
  const locale = lang === "it" ? "it-IT" : "en-GB";

  const initials = atleta
    ? `${atleta.nome.charAt(0)}${atleta.cognome.charAt(0)}`.toUpperCase()
    : "";
  const avatarUrl = strapiMediaUrl(atleta?.avatar);

  const roleLine = atleta
    ? [
        atleta.ruolo ? (t as unknown as Record<string, string>)[RUOLO_KEY[atleta.ruolo]] : null,
        atleta.squadra?.nome ?? null,
      ]
        .filter(Boolean)
        .join(" • ") || t.role_unset
    : "";

  const dob = atleta?.dataNascita ? new Date(atleta.dataNascita).toLocaleDateString(locale) : null;
  const piedeLabel = atleta?.piedePreferito
    ? (t as unknown as Record<string, string>)[PIEDE_KEY[atleta.piedePreferito]]
    : null;

  return (
    <AppShell eyebrow={t.eyebrow} title={t.title}>
      <Card className="mb-5 flex items-center gap-4 !p-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-2xl font-semibold text-accent-foreground">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={atleta?.nomeCompleto ?? ""}
              className="h-full w-full object-cover"
            />
          ) : isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <span className="text-display">{initials}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-display text-lg font-semibold">{atleta?.nomeCompleto ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{roleLine}</p>
          {atleta?.proStatus && (
            <span className="mt-1 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
              {t.pro}
            </span>
          )}
        </div>
      </Card>

      {isError && <Card className="mb-5 !p-4 text-sm text-destructive">{t.load_error}</Card>}

      <h3 className="text-display mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t.details}
      </h3>
      <Card className="mb-5 divide-y divide-border !p-0">
        <Field label={t.name} value={atleta?.nome ?? null} />
        <Field label={t.surname} value={atleta?.cognome ?? null} />
        <Field label={t.dob} value={dob} icon={<Cake className="size-4" />} />
        <Field
          label={t.height}
          value={atleta?.altezzaCm != null ? `${atleta.altezzaCm} cm` : null}
          icon={<Ruler className="size-4" />}
        />
        <Field
          label={t.weight}
          value={atleta?.pesoKg != null ? `${atleta.pesoKg} kg` : null}
          icon={<Weight className="size-4" />}
        />
        <Field
          label={t.shirt_number}
          value={atleta?.numeroMaglia != null ? String(atleta.numeroMaglia) : null}
          icon={<Hash className="size-4" />}
        />
        <Field
          label={t.preferred_foot}
          value={piedeLabel}
          icon={<Footprints className="size-4" />}
        />
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
          logout();
          navigate({ to: "/login", replace: true });
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <LogOut className="size-4" /> {t.logout}
      </button>
    </AppShell>
  );
}

function Field({ label, value, icon }: { label: string; value: string | null; icon?: ReactNode }) {
  if (!value) return null;
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
