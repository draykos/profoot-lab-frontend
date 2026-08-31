import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { useT } from "@/lib/i18n";
import { strapiForgotPassword, StrapiError } from "@/lib/strapi";
import { AuthField } from "./login";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Recupera password — Profoot Lab" },
      { name: "description", content: "Richiedi il link per reimpostare la password del tuo account Profoot Lab." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ForgotPasswordPage() {
  const t = useT("login");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await strapiForgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      if (err instanceof StrapiError && err.status === 0) setError(t.err_network);
      else setSent(true); // do not disclose whether the email exists
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title={t.forgot_title} subtitle={t.forgot_sub}>
      {sent ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm">
          <MailCheck className="mb-2 size-5 text-accent" />
          {t.forgot_sent}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <AuthField
            label={t.email}
            type="email"
            value={email}
            placeholder={t.email_ph}
            onChange={setEmail}
            autoComplete="email"
          />
          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !email}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground transition active:scale-[0.98] disabled:opacity-50"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {t.forgot_cta}
          </button>
        </form>
      )}

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> {t.back_login}
      </Link>
    </AuthLayout>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-6 py-14 text-foreground">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-accent shadow-glow" />
          <span className="text-display text-sm font-semibold uppercase tracking-[0.25em]">
            Profoot<span className="text-accent"> Lab</span>
          </span>
        </div>
        <h1 className="text-display text-3xl font-semibold leading-tight">{title}</h1>
        <p className="mb-7 mt-2 text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
