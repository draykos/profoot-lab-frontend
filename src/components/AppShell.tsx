import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, Dumbbell, Activity, User, HeartPulse, Loader2 } from "lucide-react";
import { LanguageToggle, useT } from "@/lib/i18n";
import { useRequireAuth } from "@/lib/auth";

interface AppShellProps {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function AppShell({ title, eyebrow, children, action }: AppShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = useT("nav");
  const { ready } = useRequireAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }


  const navItems = [
    { to: "/", label: nav.home, icon: Home },
    { to: "/training", label: nav.train, icon: Dumbbell },
    { to: "/test", label: nav.test, icon: Activity },
    { to: "/body", label: nav.body, icon: HeartPulse },
    { to: "/profile", label: nav.profile, icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="mx-auto max-w-lg px-5 pt-6">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {eyebrow}
              </span>
            )}
            {title && (
              <h1 className="text-display text-3xl font-semibold leading-tight">{title}</h1>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {action}
            <LanguageToggle />
          </div>
        </header>
        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-sm items-center justify-between rounded-full border border-border bg-background/80 px-2 py-2 shadow-glow backdrop-blur-xl">
        {navItems.map((item) => {
          const active =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-1 rounded-full px-2 py-2 transition ${
                active ? "text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex size-9 items-center justify-center rounded-full transition ${
                  active ? "bg-accent" : "bg-transparent"
                }`}
              >
                <Icon className="size-4" strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-card p-4 ring-1 ring-inset ring-border ${className}`}
    >
      {children}
    </div>
  );
}
