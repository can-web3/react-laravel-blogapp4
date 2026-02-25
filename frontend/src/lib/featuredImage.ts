/**
 * Storage URL bazen port içermez (örn. http://localhost/storage/...); API base ile düzeltir.
 */
export function featuredImageSrc(url: string | null | undefined): string {
  if (!url) return "";
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  if (!apiBase) return url;
  if (url.startsWith("/")) return `${apiBase}${url}`;
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" && !u.port && apiBase.startsWith("http")) {
      const base = new URL(apiBase);
      return `${base.origin}${u.pathname}${u.search}`;
    }
  } catch {
    // ignore
  }
  return url;
}
