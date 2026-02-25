import { useCallback, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FileText } from "lucide-react";
import { useAuthorBySlug } from "@/hooks/usePopularAuthors";
import { usePublicBlogsByAuthor } from "@/hooks/usePublicBlogs";
import { PageSEO } from "@/components/PageSEO";

export default function AuthorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const { author, loading: authorLoading, error: authorError, refetch: refetchAuthor } = useAuthorBySlug(slug);
  const {
    blogs,
    meta,
    loading: blogsLoading,
    error: blogsError,
    refetch: refetchBlogs,
  } = usePublicBlogsByAuthor(slug, page);

  const setPage = useCallback(
    (p: number) => {
      const next = new URLSearchParams(searchParams);
      if (p <= 1) next.delete("page");
      else next.set("page", String(p));
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (slug) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug, page]);

  if (!slug) {
    navigate("/blogs", { replace: true });
    return null;
  }

  const authorNotFound = !authorLoading && (authorError || (!author && slug));
  const authorTitle = author?.name ?? slug;

  return (
    <main className="min-h-screen border-b bg-background">
      <PageSEO
        title={`Author: ${authorTitle}`}
        description={author?.bio ?? (author ? `Posts by ${author.name}.` : undefined)}
        canonicalPath={slug ? `/authors/${slug}` : undefined}
        image={author?.avatar}
      />
      <div className="container mx-auto px-4 py-8 sm:py-10">
        {authorLoading && (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="size-24 shrink-0 animate-pulse rounded-full bg-muted" aria-hidden />
            <div className="flex-1 space-y-2">
              <div className="h-8 w-48 animate-pulse rounded bg-muted" aria-hidden />
              <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" aria-hidden />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" aria-hidden />
            </div>
          </div>
        )}
        {authorError && !author && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">Author not found</p>
            <p className="mt-1 text-sm opacity-90">
              This author may not exist or the link is incorrect.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetchAuthor()}>
              Retry
            </Button>
            <Button variant="link" size="sm" className="ml-2 mt-3" asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        )}
        {author && (
          <header className="flex flex-col items-center gap-4 border-b border-border pb-8 sm:flex-row sm:items-start sm:text-left">
            <img
              src={author.avatar}
              alt={author.name}
              className="size-24 shrink-0 rounded-full object-cover ring-2 ring-border/50 sm:size-28"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {author.name}
              </h1>
              {author.bio && (
                <p className="mt-2 text-muted-foreground">{author.bio}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1.5">
                  <FileText className="size-4" />
                  {author.posts} {author.posts === 1 ? "post" : "posts"}
                </span>
              </div>
            </div>
          </header>
        )}

        {!authorNotFound && (
          <div className="mt-8">
            {blogsLoading && (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="h-80 animate-pulse rounded-2xl bg-muted" aria-hidden />
                ))}
              </ul>
            )}
            {!blogsLoading && blogsError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <p className="font-medium">Failed to load blogs</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => refetchBlogs()}>
                  Retry
                </Button>
              </div>
            )}
            {!blogsLoading && !blogsError && blogs.length === 0 && (
              <div className="rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
                <p className="font-medium">No published posts yet</p>
                <Button variant="default" className="mt-4" asChild>
                  <Link to="/blogs">Browse all blogs</Link>
                </Button>
              </div>
            )}
            {!blogsLoading && !blogsError && blogs.length > 0 && (
              <>
                {meta?.total != null && (
                  <p className="mb-4 text-sm text-muted-foreground">
                    {meta.total} {meta.total === 1 ? "post" : "posts"}
                  </p>
                )}
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {blogs.map((blog) => (
                    <li key={blog.id}>
                      <BlogCard blog={blog} />
                    </li>
                  ))}
                </ul>
                {meta && meta.last_page > 1 && (
                  <Pagination className="mt-10">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          aria-disabled={page <= 1}
                          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - page) <= 1)
                        .map((p, i, arr) => (
                          <PaginationItem key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && (
                              <span className="px-2 text-muted-foreground">…</span>
                            )}
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(p);
                              }}
                              isActive={p === page}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < meta.last_page) setPage(page + 1);
                          }}
                          aria-disabled={page >= meta.last_page}
                          className={page >= meta.last_page ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
