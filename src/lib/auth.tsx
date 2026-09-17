import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  strapiLogin,
  strapiMe,
  type StrapiUser,
} from "./strapi";

const STORAGE_KEY = "profoot_auth";

interface StoredSession {
  jwt: string;
  user: StrapiUser;
}

/** Reads the `exp` claim of a JWT (seconds since epoch), if present. */
function jwtExpiry(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const exp = jwtExpiry(token);
  if (exp === null) return false; // no exp claim -> treat as long-lived
  return Date.now() >= exp * 1000;
}

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.jwt || isExpired(parsed.jwt)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

interface AuthCtx {
  user: StrapiUser | null;
  jwt: string | null;
  /** true until the stored session has been restored on the client */
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  setSession: (jwt: string, user: StrapiUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<StoredSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on mount: the JWT survives app restarts until it expires.
  useEffect(() => {
    const stored = readSession();
    setSessionState(stored);
    setLoading(false);

    // Best-effort revalidation against Strapi (revoked / blocked users).
    if (stored) {
      strapiMe(stored.jwt).catch((err: unknown) => {
        const status = (err as { status?: number }).status;
        if (status === 401 || status === 403) {
          localStorage.removeItem(STORAGE_KEY);
          setSessionState(null);
        }
      });
    }
  }, []);

  const setSession = useCallback((jwt: string, user: StrapiUser) => {
    const next = { jwt, user };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    setSessionState(next);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const res = await strapiLogin(identifier, password);
      setSession(res.jwt, res.user);
    },
    [setSession],
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    setSessionState(null);
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user: session?.user ?? null,
      jwt: session?.jwt ?? null,
      loading,
      isAuthenticated: !!session,
      login,
      setSession,
      logout,
    }),
    [session, loading, login, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

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
