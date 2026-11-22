import { createContext, useContext, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { StrapiUser } from "./strapi";

// The provider holding the session lives in src/components/AuthProvider.tsx; this module only
// exposes the context and the hooks, so it contains no components.

export interface AuthCtx {
  user: StrapiUser | null;
  jwt: string | null;
  /** true until the stored session has been restored on the client */
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  setSession: (jwt: string, user: StrapiUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Redirects to /login when there is no valid session. */
export function useRequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  return { ready: !loading && isAuthenticated };
}
