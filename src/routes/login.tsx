import { createFileRoute, useNavigate } from "@tanstack/react-router";
import stadium from "@/assets/stadium-tunnel.jpg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Accedi — Sistema Atleta Pro" },
      { name: "description", content: "Accedi con Google per entrare nella tua area calciatore." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="relative h-[55vh] w-full overflow-hidden">
        <img
          src={stadium}
          alt="Tunnel dello stadio illuminato dai riflettori"
          className="h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="absolute left-5 top-6 flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-accent shadow-glow" />
          <span className="text-display text-sm font-semibold uppercase tracking-[0.25em]">
            Atleta<span className="text-accent">Pro</span>
          </span>
        </div>
      </div>

      <div className="relative -mt-16 flex flex-1 flex-col justify-between px-6 pb-10">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
            Area calciatore
          </span>
          <h1 className="text-display mt-2 text-4xl font-semibold leading-[1.05]">
            Entra in campo,<br />
            <span className="text-accent">a modo tuo.</span>
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Il tuo piano di allenamento, dieta e recupero — sincronizzato con lo staff tecnico.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              try {
                localStorage.setItem("atleta_auth", "1");
              } catch {}
              navigate({ to: "/" });
            }}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-foreground py-3.5 text-sm font-semibold text-background transition active:scale-[0.98]"
          >
            <GoogleGlyph />
            Continua con Google
          </button>
          <p className="px-6 text-center text-[10px] leading-relaxed text-muted-foreground">
            Accedendo accetti i Termini di Servizio e la Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.07-1.1-.15-1.6H12z"
      />
    </svg>
  );
}
