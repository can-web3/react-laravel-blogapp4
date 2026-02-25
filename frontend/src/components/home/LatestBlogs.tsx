import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import BlogCard from "../BlogCard";
import { usePublicBlogs } from "@/hooks/usePublicBlogs";

const LIMIT = 8;

export default function LatestBlogs() {
  const { blogs, loading, error } = usePublicBlogs(LIMIT, "latest");

  return (
    <section
      className="bg-muted/20 py-8 sm:py-12 md:py-16"
      aria-labelledby="latest-heading"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2
              id="latest-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Latest blogs
            </h2>
            <p className="mt-2 text-muted-foreground">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Loading…
                </span>
              ) : (
                "Latest blogs this week"
              )}
            </p>
          </div>
          {!loading && (
            <Link
              to="/blogs?sort=latest"
              className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
            >
              View all latest blogs
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {loading && (
          <div className="mt-10" role="status" aria-live="polite" aria-label="Loading latest blogs">
            <p className="sr-only">Loading latest blogs</p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="h-[320px] min-h-[320px] animate-pulse rounded-2xl bg-muted/50" />
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="mt-10 text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && blogs.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">
            No blogs yet.
          </p>
        )}

        {!loading && !error && blogs.length > 0 && (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
