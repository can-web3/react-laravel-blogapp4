import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  BookmarkCheck,
  Calendar,
  Clock,
  Share2,
  Send,
  Loader2,
  LogIn,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/BlogCard";
import { useBlogBySlug } from "@/hooks/useBlogBySlug";
import { useBlogComments } from "@/hooks/useBlogComments";
import { useBlogLike } from "@/hooks/useBlogLike";
import { useBlogBookmark } from "@/hooks/useBlogBookmark";
import { featuredImageSrc } from "@/lib/featuredImage";
import { usePublicBlogs } from "@/hooks/usePublicBlogs";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogs } from "@/contexts/BlogsContext";
import { PageSEO } from "@/components/PageSEO";
import { SITE_NAME, absoluteUrl } from "@/lib/siteConfig";

function formatPublishedAt(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function formatCommentDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  } catch {
    return "";
  }
}

const defaultAvatar = "https://i.pravatar.cc/150?u=user";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { blog, loading, error } = useBlogBySlug(slug);
  const { deleteBlog } = useBlogs();
  const [deleting, setDeleting] = useState(false);
  const isOwner = isAuthenticated && user && blog?.user_id === user.id;
  const { comments, loading: commentsLoading, error: commentsError, addComment } = useBlogComments(slug);
  const { likeCount, userHasLiked, toggleLike, loading: likeLoading, error: likeError } = useBlogLike(slug, {
    likeCount: blog?.like_count ?? 0,
    userHasLiked: blog?.user_has_liked ?? false,
  });
  const { bookmarkCount, userHasBookmarked, toggleBookmark, loading: bookmarkLoading, error: bookmarkError } = useBlogBookmark(slug, {
    bookmarkCount: blog?.bookmark_count ?? 0,
    userHasBookmarked: blog?.user_has_bookmarked ?? false,
  });
  const { blogs: latestBlogs } = usePublicBlogs(4, "latest");
  const relatedBlogs = latestBlogs.filter((b) => b.slug !== slug).slice(0, 2);
  const [commentBody, setCommentBody] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  if (loading) {
    return (
      <main className="min-h-screen border-b bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="size-10 animate-spin" aria-hidden />
            <p>Loading post…</p>
          </div>
        </div>
      </main>
    );
  }

  if (error === "not_found" || (!loading && !blog)) {
    return (
      <main className="min-h-screen border-b bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
          <p className="mt-2 text-muted-foreground">
            The blog post you're looking for doesn't exist or may have been removed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/blogs">Back to blogs</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="min-h-screen border-b bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-destructive">{error ?? "Failed to load post."}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/blogs">Back to blogs</Link>
          </Button>
        </div>
      </main>
    );
  }

  const imageUrl = featuredImageSrc(blog.featured_image) || "https://picsum.photos/seed/blog/1200/600";
  const categorySlug = blog.category?.slug ?? blog.category?.name?.toLowerCase() ?? "";
  const readTime = blog.reading_time_minutes != null
    ? `${blog.reading_time_minutes} min`
    : "—";

  const seoTitle = blog.meta_title ?? blog.title;
  const seoDescription = blog.meta_description ?? blog.excerpt ?? undefined;
  const authorName = blog.user?.username ?? undefined;
  const canonicalPath = slug ? `/blogs/${slug}` : undefined;
  const jsonLd =
    slug && seoTitle
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: seoTitle,
          description: seoDescription ?? undefined,
          image: imageUrl,
          datePublished: blog.published_at ?? blog.created_at ?? undefined,
          dateModified: blog.updated_at ?? blog.published_at ?? blog.created_at ?? undefined,
          author:
            authorName || SITE_NAME
              ? { "@type": "Person" as const, name: authorName ?? SITE_NAME }
              : undefined,
          publisher: { "@type": "Organization" as const, name: SITE_NAME },
          mainEntityOfPage: canonicalPath ? { "@type": "WebPage" as const, "@id": absoluteUrl(canonicalPath) } : undefined,
        }
      : undefined;

  return (
    <main className="min-h-screen border-b bg-background">
      <PageSEO
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        image={imageUrl}
        type="article"
        publishedTime={blog.published_at ?? blog.created_at ?? undefined}
        modifiedTime={blog.updated_at ?? blog.published_at ?? blog.created_at ?? undefined}
        author={authorName}
        jsonLd={jsonLd}
      />
      <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 gap-1">
          <Link to="/blogs">
            <ArrowLeft className="size-4" />
            Back to blogs
          </Link>
        </Button>

        <article>
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <img
              src={imageUrl}
              alt={blog.title}
              className="w-full object-cover aspect-[2/1]"
            />
          </div>

          <header className="mt-6">
            {categorySlug ? (
              <Link
                to={`/categories/${categorySlug}`}
                className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {blog.category?.name ?? "Uncategorized"}
              </Link>
            ) : (
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {blog.category?.name ?? "Uncategorized"}
              </span>
            )}
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {blog.title}
            </h1>
            {blog.excerpt && (
              <p className="mt-3 text-lg text-muted-foreground">
                {blog.excerpt}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <img
                  src={defaultAvatar}
                  alt={blog.user?.username ?? "Author"}
                  className="size-10 rounded-full object-cover ring-2 ring-border/50"
                />
                <span className="font-medium text-foreground">
                  {blog.user?.username ?? "Author"}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Calendar className="size-4" />
                {formatPublishedAt(blog.published_at ?? blog.created_at)}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Clock className="size-4" />
                {readTime}
              </span>
              {isOwner && slug && (
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <Link to={`/blogs/${slug}/edit`}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={deleting}
                    onClick={async () => {
                      if (!slug || !window.confirm('Delete this post? This cannot be undone.')) return;
                      setDeleting(true);
                      try {
                        await deleteBlog(slug);
                        navigate("/profile");
                      } finally {
                        setDeleting(false);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    {deleting ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-6 text-muted-foreground text-sm">
              <button
                type="button"
                onClick={toggleLike}
                disabled={likeLoading}
                className="flex items-center gap-1.5 transition-colors hover:text-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                aria-pressed={userHasLiked}
                aria-label={userHasLiked ? "Unlike" : "Like"}
              >
                {userHasLiked ? (
                  <ThumbsUp className="size-4 fill-primary text-primary" aria-hidden />
                ) : (
                  <ThumbsUp className="size-4" aria-hidden />
                )}
                <span>{likeCount}</span>
              </button>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="size-4" aria-hidden />
                {comments.length}
              </span>
              <button
                type="button"
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
                className="flex items-center gap-1.5 transition-colors hover:text-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                aria-pressed={userHasBookmarked}
                aria-label={userHasBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {userHasBookmarked ? (
                  <BookmarkCheck className="size-4 fill-primary text-primary" aria-hidden />
                ) : (
                  <BookmarkCheck className="size-4" aria-hidden />
                )}
                <span>{bookmarkCount}</span>
              </button>
            </div>
            {(likeError || bookmarkError) && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {likeError ?? bookmarkError}
              </p>
            )}

            {(blog.tags?.length ?? 0) > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(blog.tags ?? []).map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/tags/${tag.slug}`}
                    className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          <div className="mt-10 border-t border-border pt-8">
            <div
              className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90"
              dangerouslySetInnerHTML={{ __html: blog.body || "" }}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Share2 className="size-4" />
              Share
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                X
              </Button>
              <Button variant="outline" size="sm">
                LinkedIn
              </Button>
              <Button variant="outline" size="sm">
                Copy
              </Button>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-muted/30 p-6 text-center shadow-sm">
              <MessageCircle className="mx-auto size-12 text-muted-foreground" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold text-foreground">
                Log in to comment
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You need to be signed in to leave a comment on this post.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="gap-2">
                  <Link to="/login">
                    <LogIn className="size-4" />
                    Log in
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/register">Create account</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <p className="mb-2 text-sm text-muted-foreground">
                Add a comment
              </p>
              {commentError && (
                <p className="mb-2 text-sm text-destructive" role="alert">
                  {commentError}
                </p>
              )}
              <form
                className="flex flex-col gap-2 sm:flex-row sm:items-end"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setCommentError(null);
                  setCommentSubmitting(true);
                  const result = await addComment(commentBody);
                  setCommentSubmitting(false);
                  if (result.success) {
                    setCommentBody("");
                  } else {
                    setCommentError(result.error ?? "Failed to add comment");
                  }
                }}
              >
                <textarea
                  placeholder="Write your comment..."
                  className="min-h-[80px] flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring resize-y"
                  aria-label="Comment"
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  disabled={commentSubmitting}
                  maxLength={2000}
                  rows={3}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1 shrink-0"
                  disabled={commentSubmitting || !commentBody.trim()}
                >
                  {commentSubmitting ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {commentSubmitting ? "Sending…" : "Send"}
                </Button>
              </form>
              <p className="mt-1 text-xs text-muted-foreground">
                {commentBody.length}/2000
              </p>
            </div>
          )}

          <section className="mt-12 border-t border-border pt-10" aria-label="Comments">
            <h2 className="text-xl font-semibold text-foreground">
              Comments ({commentsLoading ? "…" : comments.length})
            </h2>

            {commentsLoading && (
              <p className="mt-4 text-sm text-muted-foreground">Loading comments…</p>
            )}
            {commentsError && (
              <p className="mt-4 text-sm text-destructive" role="alert">{commentsError}</p>
            )}
            {!commentsLoading && !commentsError && comments.length > 0 && (
              <ul className="mt-6 space-y-6">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {(c.user?.username ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">
                          {c.user?.username ?? "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCommentDate(c.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {c.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!commentsLoading && !commentsError && comments.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">No comments yet.</p>
            )}
          </section>

          <section className="mt-12 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm ring-1 ring-border/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img
                src={defaultAvatar}
                alt={blog.user?.username ?? "Author"}
                className="size-20 shrink-0 rounded-full object-cover ring-2 ring-border"
              />
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">
                  {blog.user?.username ?? "Author"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Author of this post.
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/blogs">All posts</Link>
                </Button>
              </div>
            </div>
          </section>

          {relatedBlogs.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold text-foreground">
                Related posts
              </h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {relatedBlogs.map((b) => (
                  <Link key={b.id} to={`/blogs/${b.slug}`} className="block h-full">
                    <BlogCard blog={b} noList />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-12 overflow-hidden rounded-2xl border bg-primary/5 p-6 text-center sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">
              Stay in the loop
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe to our weekly newsletter and don't miss the best reads.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:mx-auto sm:max-w-sm sm:flex-row">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Email"
              />
              <Button>Subscribe</Button>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
