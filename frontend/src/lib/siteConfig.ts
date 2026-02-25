/**
 * Site-wide SEO and branding config.
 * VITE_APP_URL should be the public origin (e.g. https://yoursite.com) for canonical/OG URLs.
 */
export const SITE_NAME = "BlogApp";
export const SITE_TAGLINE = "Read, write, and discover stories.";
export const DEFAULT_META_DESCRIPTION =
  "Discover articles, guides, and stories. Browse by category, tag, or author.";

function getEnvUrl(): string {
  const url = import.meta.env.VITE_APP_URL;
  if (typeof url === "string" && url.trim()) return url.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "";
}

/** Absolute base URL for the site (no trailing slash). Used for canonical and og:url. */
export function getBaseUrl(): string {
  return getEnvUrl();
}

/** Build absolute URL for a path (used for canonical and og:url). */
export function absoluteUrl(path: string): string {
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
