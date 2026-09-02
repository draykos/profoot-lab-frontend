/**
 * Public base URL of the site, used for `<link rel="canonical">`, `og:url`
 * and the sitemap. Comes from the VITE_BASE_URL env variable so it can be
 * changed per environment without touching the code.
 *
 * Vite only exposes env variables prefixed with `VITE_` to client code, so the
 * variable is named `VITE_BASE_URL` (see `.env` / `.env.example`).
 */
export const SITE_URL: string =
  (import.meta.env["VITE_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:3000";

/** Absolute URL for a route path, e.g. `absoluteUrl("/body")`. */
export function absoluteUrl(path = "/"): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}
