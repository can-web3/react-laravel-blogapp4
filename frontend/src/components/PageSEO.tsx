import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { SITE_NAME, absoluteUrl } from "@/lib/siteConfig";

export interface PageSEOProps {
  /** Page title (e.g. "Blogs" or "How to cook" — we append site name where appropriate). */
  title: string;
  /** Meta description (150–160 chars ideal). */
  description?: string | null;
  /** Override canonical path (default: current pathname, no query). */
  canonicalPath?: string | null;
  /** Absolute image URL for og:image / twitter:image (e.g. featured image). */
  image?: string | null;
  /** If true, add noindex,nofollow. Use for login, register, profile, create/edit. */
  noindex?: boolean;
  /** "website" (default) or "article". */
  type?: "website" | "article";
  /** ISO date for article:published_time. */
  publishedTime?: string | null;
  /** ISO date for article:modified_time. */
  modifiedTime?: string | null;
  /** Author name for article:author (and JSON-LD). */
  author?: string | null;
  /** Optional JSON-LD script object (e.g. Article schema). */
  jsonLd?: object | null;
}

const TWITTER_HANDLE = ""; // set if you have @site

export function PageSEO({
  title,
  description,
  canonicalPath,
  image,
  noindex,
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  jsonLd,
}: PageSEOProps) {
  const location = useLocation();
  const path = canonicalPath ?? location.pathname;
  const canonicalRaw = absoluteUrl(path);
  const canonical = canonicalRaw.startsWith("http") ? canonicalRaw : null;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name" content={SITE_NAME} />
      {image && <meta property="og:image" content={image} />}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
      {TWITTER_HANDLE && <meta name="twitter:site" content={TWITTER_HANDLE} />}

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
