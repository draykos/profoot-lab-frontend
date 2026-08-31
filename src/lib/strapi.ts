/**
 * Minimal Strapi (v4/v5) Users & Permissions API client.
 * Base URL comes from the VITE_STRAPI_URL env variable so it can be
 * changed per environment without touching the code.
 */

export const STRAPI_URL: string =
  (import.meta.env['VITE_STRAPI_URL'] as string | undefined)?.replace(/\/$/, "") ??
  "https://strapi.test";

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  confirmed?: boolean;
  blocked?: boolean;
}

export interface StrapiAuthResponse {
  jwt: string;
  user: StrapiUser;
}

export class StrapiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "StrapiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const { token, headers, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(`${STRAPI_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
    });
  } catch {
    throw new StrapiError("network", 0);
  }

  const body = (await res.json().catch(() => null)) as
    | { error?: { message?: string; status?: number } }
    | null;

  if (!res.ok) {
    throw new StrapiError(body?.error?.message ?? "request_failed", res.status);
  }
  return body as T;
}

/** POST /api/auth/local — identifier can be email or username. */
export function strapiLogin(identifier: string, password: string) {
  return request<StrapiAuthResponse>("/api/auth/local", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

/** POST /api/auth/forgot-password — sends the reset email. */
export function strapiForgotPassword(email: string) {
  return request<{ ok: boolean }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** POST /api/auth/reset-password — uses the `code` from the email link. */
export function strapiResetPassword(
  code: string,
  password: string,
  passwordConfirmation: string,
) {
  return request<StrapiAuthResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ code, password, passwordConfirmation }),
  });
}

/** GET /api/users/me — validates the stored JWT against Strapi. */
export function strapiMe(token: string) {
  return request<StrapiUser>("/api/users/me", { method: "GET", token });
}
