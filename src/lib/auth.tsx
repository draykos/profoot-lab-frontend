import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  strapiLogin,
  strapiMe,
  strapiRefresh,
  setUnauthorizedHandler,
  type StrapiUser,
} from "./strapi";
import { safeStorage } from "./safeStorage";

const STORAGE_KEY = "profoot_auth";

/** How long before expiry we treat an access token as "needs refreshing". Mirrors the
 * `accessTokenLifespan - 60s` margin, but computed from the token's own `exp` claim instead of a
 * value duplicated from the backend config, so it stays correct if that config ever changes. */
const REFRESH_MARGIN_MS = 60_000;

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

/** True once the token is expired, or within `REFRESH_MARGIN_MS` of expiring. A token with no
 * `exp` claim (e.g. the dev-backdoor token) is treated as long-lived and never needs refreshing. */
function needsRefresh(token: string): boolean {
  const exp = jwtExpiry(token);
  if (exp === null) return false;
  return exp * 1000 - Date.now() < REFRESH_MARGIN_MS;
}

function readStoredSession(): StoredSession | null {
  const raw = safeStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    // Guards against corrupted/malformed stored JSON, not storage availability.
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed?.jwt ? parsed : null;
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

  // Mirrors `session` so async callbacks (refresh, the unauthorized handler) always read the
  // latest value without needing to be re-created on every session change.
  const sessionRef = useRef<StoredSession | null>(null);
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  const applySession = useCallback((next: StoredSession | null) => {
    sessionRef.current = next;
    setSessionState(next);
  }, []);

  const setSession = useCallback(
    (jwt: string, user: StrapiUser) => {
      const next = { jwt, user };
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      applySession(next);
    },
    [applySession],
  );

  const logout = useCallback(() => {
    safeStorage.removeItem(STORAGE_KEY);
    applySession(null);
  }, [applySession]);

  // Exchanges the httpOnly refresh cookie for a new access token, keeping the current user.
  // Concurrent callers (several 401s at once, or the visibility check racing the mount check)
  // share a single in-flight request instead of each firing their own /api/auth/refresh call.
  const refreshToken = useCallback((): Promise<string | null> => {
    if (refreshInFlight.current) return refreshInFlight.current;

    const current = sessionRef.current;
    if (!current) return Promise.resolve(null);

    const promise = (async () => {
      try {
        const { jwt: newJwt } = await strapiRefresh();
        setSession(newJwt, current.user);
        return newJwt;
      } catch {
        // Refresh token missing/expired/revoked — the session is genuinely over.
        logout();
        return null;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = promise;
    return promise;
  }, [setSession, logout]);

  // Lets the low-level Strapi client refresh transparently and retry once on a 401, for any
  // authenticated call made anywhere in the app (not just ones going through this effect).
  useEffect(() => {
    setUnauthorizedHandler(refreshToken);
    return () => setUnauthorizedHandler(null);
  }, [refreshToken]);

  // Restore the session on mount. If the stored access token is already expired or close to it,
  // refresh proactively before rendering anything auth-gated, instead of dropping straight to
  // /login — the refresh token (cookie, up to 30 days) is very likely still valid.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = readStoredSession();
      if (!stored) {
        setLoading(false);
        return;
      }
      sessionRef.current = stored;

      if (needsRefresh(stored.jwt)) {
        const newJwt = await refreshToken();
        if (cancelled) return;
        if (!newJwt) {
          setLoading(false);
          return;
        }
      } else {
        applySession(stored);
      }

      setLoading(false);

      // Best-effort revalidation against Strapi (revoked / blocked users).
      const jwt = sessionRef.current?.jwt;
      if (jwt) {
        strapiMe(jwt).catch((err: unknown) => {
          if (cancelled) return;
          const status = (err as { status?: number }).status;
          if (status === 401 || status === 403) logout();
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once; refreshToken/logout/applySession are stable
  }, []);

  // Covers the mobile "app was backgrounded past expiry, then reopened" case, where a foreground
  // timer would have been throttled or suspended: check on the way back to the foreground instead.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      const current = sessionRef.current;
      if (current && needsRefresh(current.jwt)) void refreshToken();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshToken]);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const res = await strapiLogin(identifier, password);
      setSession(res.jwt, res.user);
    },
    [setSession],
  );

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
