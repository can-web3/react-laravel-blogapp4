import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { usePublicBlogsList, type SortKind } from "@/hooks/usePublicBlogs";
import { PageSEO } from "@/components/PageSEO";
import { DEFAULT_META_DESCRIPTION } from "@/lib/siteConfig";

const SEARCH_DEBOUNCE_MS = 400;

export default function Blogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const sortParam = searchParams.get("sort");
  const sort: SortKind =
    sortParam === "trending" ? "trending" : sortParam === "discussed" ? "discussed" : "latest";

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

  const {
    blogs,
    meta,
    loading: blogsLoading,
    error: blogsError,
    refetch: refetchBlogs,
  } = usePublicBlogsList(page, sort, debouncedSearch || undefined);

  const setPage = useCallback(
    (p: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (p <= 1) next.delete("page");
        else next.set("page", String(p));
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setSort = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("page");
        if (value === "trending") next.set("sort", "trending");
        else if (value === "discussed") next.set("sort", "discussed");
        else next.delete("sort");
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, sort]);

  return (
    <>
      <PageSEO
        title="Blogs"
        description={DEFAULT_META_DESCRIPTION}
        canonicalPath="/blogs"
      />
      <main className="min-h-screen border-b bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Blogs
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              {meta?.total != null
                ? `${meta.total} blog${meta.total === 1 ? "" : "s"}`
                : "Browse all posts"}
            </p>
          </div>
          <div className="w-full sm:w-64 shrink-0">
            <label htmlFor="blogs-search" className="sr-only">
              Search blogs by title
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
                aria-hidden
              />
              <Input
                id="blogs-search"
                type="search"
                placeholder="Search by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
                autoComplete="off"
                aria-describedby={debouncedSearch ? "blogs-search-results" : undefined}
              />
            </div>
            {debouncedSearch && (
              <p id="blogs-search-results" className="mt-1 text-muted-foreground text-xs">
                Showing results for &quot;{debouncedSearch}&quot;
              </p>
            )}
          </div>
        </div>

        <Tabs value={sort} onValueChange={setSort} className="mt-6">
          <TabsList className="w-fit">
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="discussed">Most discussed</TabsTrigger>
          </TabsList>
          <TabsContent value={sort} className="mt-8">
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
                <p className="font-medium">
                  {debouncedSearch ? "No blogs match your search." : "No blogs yet."}
                </p>
                {debouncedSearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSearchInput("")}
                  >
                    Clear search
                  </Button>
                )}
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
          </TabsContent>
        </Tabs>
      </div>
    </main>
    </>
  );
}
