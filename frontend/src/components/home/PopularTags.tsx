import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePopularTags, type PopularTagItem } from "@/hooks/usePopularTags";

const POPULAR_TAGS_LIMIT = 9;

function getTagSize(count: number): string {
  if (count >= 150) return "text-base font-semibold px-4 py-2";
  if (count >= 100) return "text-sm font-medium px-3.5 py-1.5";
  if (count >= 70) return "text-sm px-3 py-1.5";
  return "text-xs px-2.5 py-1";
}

export default function PopularTags() {
  const { tags, loading, error } = usePopularTags(POPULAR_TAGS_LIMIT);

  return (
    <section className="border-b py-16 sm:py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Popular tags
            </h2>
            <p className="mt-2 text-muted-foreground">
              Discover content by topic
            </p>
          </div>
          <Link
            to="/blogs"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            All blogs
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {loading && (
          <div className="mt-10 flex flex-wrap gap-2.5">
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className="h-8 w-20 animate-pulse rounded-full bg-muted"
                aria-hidden
              />
            ))}
          </div>
        )}
        {error && (
          <p className="mt-10 text-sm text-muted-foreground" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && tags.length === 0 && (
          <p className="mt-10 text-muted-foreground">No tags yet.</p>
        )}
        {!loading && !error && tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2.5">
            {tags.map((tag: PopularTagItem) => (
              <Link
                key={tag.slug}
                to={`/tags/${tag.slug}`}
                className={`inline-flex items-center gap-1.5 rounded-full bg-muted ring-1 ring-border/40 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:ring-primary/30 ${getTagSize(tag.count)}`}
              >
                #{tag.name}
                <span className="text-[10px] opacity-60">{tag.count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
