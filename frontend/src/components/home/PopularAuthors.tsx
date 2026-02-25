import { Link } from "react-router-dom";
import { ArrowRight, FileText, Users } from "lucide-react";
import { usePopularAuthors } from "@/hooks/usePopularAuthors";

export default function PopularAuthors() {
  const { authors, loading, error } = usePopularAuthors(6);

  return (
    <section className="border-b bg-background py-16 sm:py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Popular authors
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Writers the community loves
            </p>
          </div>
          <Link
            to="/authors"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
          >
            All authors
            <ArrowRight className="size-4 shrink-0" />
          </Link>
        </div>

        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        )}
        {error && (
          <p className="mt-10 text-sm text-destructive" role="alert">{error}</p>
        )}
        {!loading && !error && authors.length === 0 && (
          <p className="mt-10 text-muted-foreground">No authors yet.</p>
        )}
        {!loading && !error && authors.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <Link
                key={author.id}
                to={`/authors/${author.slug}`}
                className="group flex flex-col rounded-2xl border bg-card p-6 shadow-sm ring-1 ring-border/50 transition-all duration-200 hover:shadow-md hover:ring-border"
              >
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="size-16 shrink-0 rounded-full object-cover ring-2 ring-border/50 transition-transform group-hover:ring-primary/30"
                  />
                  <div className="mt-4 min-w-0 flex-1 sm:ml-4 sm:mt-0">
                    <h3 className="font-semibold text-foreground">
                      {author.name}
                    </h3>
                    <p className="mt-1 text-muted-foreground text-sm line-clamp-2">
                      {author.bio || "Writer"}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-muted-foreground text-xs sm:justify-start">
                      <span className="flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        {author.posts} {author.posts === 1 ? "post" : "posts"}
                      </span>
                      {author.followers > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          {author.followers.toLocaleString()} followers
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
