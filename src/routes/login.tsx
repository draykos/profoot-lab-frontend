import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import stadium from "@/assets/stadium-tunnel.jpg";
import { LanguageToggle, useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { StrapiError } from "@/lib/strapi";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Accedi — Profoot Lab" },
      { name: "description", content: "Accedi alla tua area calciatore di Profoot Lab." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const t = useT("login");
  const { login, isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/", replace: true });
  }, [loading, isAuthenticated, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate({ to: "/", replace: true });
    } catch (err) {
      if (err instanceof StrapiError) {
        if (err.status === 0) setError(t.err_network);
        else if (err.status === 400 || err.status === 401) setError(t.err_credentials);
        else setError(t.err_generic);
      } else {
        setError(t.err_generic);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="relative h-[38vh] w-full overflow-hidden">
        <img
          src={stadium}
          alt="Stadium tunnel"
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="absolute left-5 top-6 flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-accent shadow-glow" />
          <span className="text-display text-sm font-semibold uppercase tracking-[0.25em]">
            Profoot<span className="text-accent"> Lab</span>
          </span>
        </div>
        <div className="absolute right-5 top-5">
          <LanguageToggle />
        </div>
      </div>

      <div className="relative -mt-14 flex flex-1 flex-col justify-between px-6 pb-10">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
            {t.area}
          </span>
          <h1 className="text-display mt-2 text-4xl font-semibold leading-[1.05]">
            {t.title_1}
            <br />
            <span className="text-accent">{t.title_2}</span>
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{t.sub}</p>

          <form onSubmit={onSubmit} className="mt-7 space-y-3">
            <AuthField
              label={t.email}
              type="email"
              value={email}
              placeholder={t.email_ph}
              onChange={setEmail}
              autoComplete="email"
            />
            <AuthField
              label={t.password}
              type="password"
              value={password}
              placeholder={t.password_ph}
              onChange={setPassword}
              autoComplete="current-password"
            />

            {error && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground transition active:scale-[0.98] disabled:opacity-50"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? t.loading : t.cta}
            </button>

            <div className="flex items-center justify-between px-1 pt-1">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-accent underline-offset-4 hover:underline"
              >
                {t.forgot}
              </Link>
              <span className="text-[10px] text-muted-foreground">{t.no_signup}</span>
            </div>
          </form>
        </div>

        <p className="mt-8 px-6 text-center text-[10px] leading-relaxed text-muted-foreground">
          {t.tos}
        </p>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent"
      />
    </label>
  );
}
