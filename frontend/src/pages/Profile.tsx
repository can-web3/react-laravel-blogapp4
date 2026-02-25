import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogs } from "@/contexts/BlogsContext";
import { usePublicBlogsByAuthor, type BlogCardBlog } from "@/hooks/usePublicBlogs";
import { PageSEO } from "@/components/PageSEO";

export default function Profile() {
  const { isInitialized, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const [blogToDelete, setBlogToDelete] = useState<BlogCardBlog | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { deleteBlog } = useBlogs();
  const {
    blogs,
    meta,
    loading: blogsLoading,
    error: blogsError,
    refetch: refetchBlogs,
  } = usePublicBlogsByAuthor(user?.slug, page);

  const handleConfirmDelete = useCallback(async () => {
    if (!blogToDelete) return;
    setDeleting(true);
    try {
      await deleteBlog(blogToDelete.slug);
      setBlogToDelete(null);
      await refetchBlogs();
    } finally {
      setDeleting(false);
    }
  }, [blogToDelete, deleteBlog, refetchBlogs]);

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

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
      return;
    }
  }, [isInitialized, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  if (!isInitialized || !user) {
    return (
      <main className="min-h-screen border-b bg-background">
        <div className="container mx-auto px-4 py-8 sm:py-10">
          <div className="flex justify-center py-12">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" aria-hidden />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen border-b bg-background">
      <PageSEO title="My Profile" noindex />
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <header className="flex flex-col items-center gap-4 border-b border-border pb-8 sm:flex-row sm:items-start sm:text-left">
          <img
            src={user.image ?? ""}
            alt={user.username}
            className="size-24 shrink-0 rounded-full object-cover ring-2 ring-border/50 sm:size-28"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {user.username}
            </h1>
            {user.email && (
              <p className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="size-4 shrink-0" aria-hidden />
                {user.email}
              </p>
            )}
            {user.bio && (
              <p className="mt-2 text-muted-foreground">{user.bio}</p>
            )}
            {user.slug && (
              <p className="mt-2 text-muted-foreground text-sm">
                <Link
                  to={`/authors/${user.slug}`}
                  className="text-primary hover:underline"
                >
                  View your public author page →
                </Link>
              </p>
            )}
            <Button className="mt-4 gap-2" asChild>
              <Link to="/blogs/new">
                <Plus className="size-4" />
                New post
              </Link>
            </Button>
          </div>
        </header>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">My posts</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Your published blog posts
          </p>

          {!user.slug && (
            <div className="mt-4 rounded-lg border bg-muted/50 p-6 text-center text-muted-foreground text-sm">
              <p>Unable to load your posts. Please refresh the page after logging in again.</p>
            </div>
          )}

          {user.slug && (
            <>
              {blogsLoading && (
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className="h-80 animate-pulse rounded-2xl bg-muted" aria-hidden />
                  ))}
                </ul>
              )}
              {!blogsLoading && blogsError && (
                <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                  <p className="font-medium">Failed to load your posts</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => refetchBlogs()}>
                    Retry
                  </Button>
                </div>
              )}
              {!blogsLoading && !blogsError && blogs.length === 0 && (
                <div className="mt-6 rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
                  <p className="font-medium">You have no published posts yet</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <Button asChild>
                      <Link to="/blogs/new">New post</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/blogs">Browse all blogs</Link>
                    </Button>
                  </div>
                </div>
              )}
              {!blogsLoading && !blogsError && blogs.length > 0 && (
                <>
                  {meta?.total != null && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {meta.total} {meta.total === 1 ? "post" : "posts"}
                    </p>
                  )}
                  <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {blogs.map((blog) => (
                      <li key={blog.id} className="flex flex-col gap-2">
                        <BlogCard blog={blog} />
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1.5" asChild>
                            <Link to={`/blogs/${blog.slug}/edit`}>
                              <Pencil className="size-3.5" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setBlogToDelete(blog)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Dialog open={!!blogToDelete} onOpenChange={(open) => !open && setBlogToDelete(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete post?</DialogTitle>
                      </DialogHeader>
                      <p className="text-muted-foreground text-sm">
                        Are you sure you want to delete &quot;{blogToDelete?.title}&quot;? This action cannot be undone.
                      </p>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setBlogToDelete(null)}
                          disabled={deleting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleConfirmDelete}
                          disabled={deleting}
                        >
                          {deleting ? "Deleting…" : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
            </>
          )}
        </section>
      </div>
    </main>
  );
}
