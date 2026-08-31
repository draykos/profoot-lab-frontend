import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { strapiResetPassword, StrapiError } from "@/lib/strapi";
import { useAuth } from "@/lib/auth";
import { AuthField } from "./login";
import { AuthLayout } from "./forgot-password";

type Search = { code?: string };

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>): Search => ({
    code: typeof search['code'] === "string" ? (search['code'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nuova password — Profoot Lab" },
      { name: "description", content: "Imposta una nuova password per il tuo account Profoot Lab." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ResetPasswordPage() {
  const t = useT("login");
  const navigate = useNavigate();
  const { code } = Route.useSearch();
  const { setSession } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code) return setError(t.err_code);
    if (password.length < 6) return setError(t.err_short);
    if (password !== confirm) return setError(t.err_mismatch);

    setSubmitting(true);
    try {
      const res = await strapiResetPassword(code, password, confirm);
      setSession(res.jwt, res.user);
      setOk(true);
      navigate({ to: "/", replace: true });
    } catch (err) {
      if (err instanceof StrapiError) {
        if (err.status === 0) setError(t.err_network);
        else if (err.status === 400) setError(t.err_code);
        else setError(t.err_generic);
      } else setError(t.err_generic);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title={t.reset_title} subtitle={t.reset_sub}>
      <form onSubmit={onSubmit} className="space-y-3">
        <AuthField
          label={t.new_password}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <AuthField
          label={t.confirm_password}
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        {error && (
          <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {error}
          </p>
        )}
        {ok && <p className="text-xs font-medium text-accent">{t.reset_ok}</p>}
        <button
          type="submit"
          disabled={submitting || !password || !confirm}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground transition active:scale-[0.98] disabled:opacity-50"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {t.reset_cta}
        </button>
      </form>

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> {t.back_login}
      </Link>
    </AuthLayout>
  );
}
