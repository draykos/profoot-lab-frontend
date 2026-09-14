/**
 * Minimal Strapi (v4/v5) Users & Permissions API client.
 * Base URL comes from the VITE_STRAPI_URL env variable so it can be
 * changed per environment without touching the code.
 */

export const STRAPI_URL: string =
  (import.meta.env["VITE_STRAPI_URL"] as string | undefined)?.replace(/\/$/, "") ??
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

  const body = (await res.json().catch(() => null)) as {
    error?: { message?: string; status?: number };
  } | null;

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
export function strapiResetPassword(code: string, password: string, passwordConfirmation: string) {
  return request<StrapiAuthResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ code, password, passwordConfirmation }),
  });
}

/** GET /api/users/me — validates the stored JWT against Strapi. */
export function strapiMe(token: string) {
  return request<StrapiUser>("/api/users/me", { method: "GET", token });
}

/** Anatomical zone enum of `api::infortunio.infortunio` (side-agnostic — see `lato`). */
export type InfortunioZona =
  | "testa_collo"
  | "spalla"
  | "gomito"
  | "polso_mano"
  | "torace"
  | "addome"
  | "lombare"
  | "anca"
  | "flessore_anca"
  | "adduttori"
  | "quadricipite"
  | "ischiocrurale"
  | "ginocchio"
  | "polpaccio"
  | "tendine_achilleo"
  | "caviglia"
  | "piede";

export type InfortunioLato = "sinistro" | "destro" | "centrale";
export type InfortunioVista = "fronte" | "retro";
export type InfortunioStato = "attivo" | "in_recupero" | "risolto";

export interface StrapiInfortunio {
  id: number;
  documentId: string;
  zona: InfortunioZona;
  lato: InfortunioLato | null;
  vista: InfortunioVista;
  posizioneTop: number;
  posizioneLeft: number;
  stato: InfortunioStato;
  diagnosi: string | null;
  indicazioni: string | null;
  dataInsorgenza: string;
  dataRisoluzione: string | null;
}

/**
 * GET /api/infortunio/me — injury history of the athlete linked to the current user,
 * most recent `dataInsorgenza` first. Health data: self-scoped only, no arbitrary filters.
 */
export function strapiInfortuni(token: string) {
  return request<{ data: StrapiInfortunio[] }>("/api/infortunio/me", { method: "GET", token });
}

export type AtletaRuolo = "portiere" | "difensore" | "centrocampista" | "attaccante";
export type AtletaPiede = "destro" | "sinistro" | "ambidestro";

export interface StrapiMedia {
  url: string;
}

export interface StrapiAtleta {
  id: number;
  documentId: string;
  nome: string;
  cognome: string;
  nomeCompleto: string;
  dataNascita: string | null;
  ruolo: AtletaRuolo | null;
  altezzaCm: number | null;
  pesoKg: number | null;
  piedePreferito: AtletaPiede | null;
  numeroMaglia: number | null;
  proStatus: boolean;
  avatar: StrapiMedia | null;
  squadra: { nome: string } | null;
}

/** GET /api/atleta/me — profile of the athlete linked to the current user. */
export function strapiAtleta(token: string) {
  return request<{ data: StrapiAtleta }>("/api/atleta/me", { method: "GET", token });
}

/** Resolves a Strapi media `url` (often relative, e.g. `/uploads/x.png`) to an absolute URL. */
export function strapiMediaUrl(media: StrapiMedia | null | undefined): string | null {
  if (!media?.url) return null;
  return media.url.startsWith("http") ? media.url : `${STRAPI_URL}${media.url}`;
}

export type VideoCoachCategoria = "pre_partita" | "focus" | "sonno" | "stress" | "recupero";

export interface StrapiVideoCoach {
  id: number;
  documentId: string;
  titolo: string;
  categoria: VideoCoachCategoria | null;
  durataMinuti: number | null;
  data: string;
  video: string;
  copertina: StrapiMedia | null;
}

/**
 * GET /api/video-coach/me — video coach assigned to the athlete linked to the current user, most
 * recent `data` first, capped server-side at the latest 15. Private per-athlete data: self-scoped
 * only, no arbitrary filters.
 */
export function strapiVideoCoach(token: string) {
  return request<{ data: StrapiVideoCoach[] }>("/api/video-coach/me", { method: "GET", token });
}
