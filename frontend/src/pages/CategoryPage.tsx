import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import BlogCard from "@/components/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search } from "lucide-react";
import { useCategoryBySlug } from "@/hooks/useCategory";
import { usePublicBlogsByCategory } from "@/hooks/usePublicBlogs";
import { PageSEO } from "@/components/PageSEO";

const SEARCH_DEBOUNCE_MS = 400;

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!debouncedSearch) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("page");
      return next;
    }, { replace: true });
  }, [debouncedSearch, setSearchParams]);

  const { category, loading: categoryLoading, error: categoryError, refetch: refetchCategory } = useCategoryBySlug(slug);
  const {
    blogs,
    meta,
    loading: blogsLoading,
    error: blogsError,
    refetch: refetchBlogs,
  } = usePublicBlogsByCategory(slug, page, debouncedSearch || undefined);

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

  const categoryNotFound = !categoryLoading && (categoryError || (!category && slug));
  const title = category?.name ?? slug;

  return (
    <main className="min-h-screen border-b bg-background">
      <PageSEO
        title={`Category: ${title}`}
        description={category ? `Browse posts in the "${category.name}" category.` : undefined}
        canonicalPath={slug ? `/categories/${slug}` : undefined}
      />
      <div className="container mx-auto px-4 py-8 sm:py-10">
        {categoryLoading && (
          <div className="mb-6 h-9 w-48 animate-pulse rounded bg-muted" aria-hidden />
        )}
        {categoryError && !category && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <p className="font-medium">Category not found</p>
            <p className="mt-1 text-sm opacity-90">
              This category may have been removed or the link is incorrect.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetchCategory()}>
              Retry
            </Button>
            <Button variant="link" size="sm" className="ml-2 mt-3" asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        )}
        {category && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Category: {title}
              </h1>
              {category.description && (
                <p className="mt-2 text-muted-foreground">{category.description}</p>
              )}
              <p className="mt-1 text-muted-foreground text-sm">
                {meta?.total != null
                  ? `${meta.total} blog${meta.total === 1 ? "" : "s"}`
                  : "Blogs in this category"}
              </p>
            </div>
            <div className="w-full sm:w-64 shrink-0">
              <label htmlFor="category-search" className="sr-only">
                Search blogs by title
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
                <Input
                  id="category-search"
                  type="search"
                  placeholder="Search by title..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                  autoComplete="off"
                  aria-describedby={debouncedSearch ? "category-search-results" : undefined}
                />
              </div>
              {debouncedSearch && (
                <p id="category-search-results" className="mt-1 text-muted-foreground text-xs">
                  Showing results for &quot;{debouncedSearch}&quot;
                </p>
              )}
            </div>
          </div>
        )}

        {!categoryNotFound && (
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
                <p className="font-medium">No blogs in this category yet</p>
                <Button variant="default" className="mt-4" asChild>
                  <Link to="/blogs">Browse all blogs</Link>
                </Button>
              </div>
            )}
            {!blogsLoading && !blogsError && blogs.length > 0 && (
              <>
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
