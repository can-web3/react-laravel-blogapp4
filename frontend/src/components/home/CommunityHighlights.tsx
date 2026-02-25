import { Link } from "react-router-dom";
import {
    ArrowRight,
    FileText,
    Users,
    MessageCircle,
    ThumbsUp,
} from "lucide-react";
import { usePopularAuthors } from "@/hooks/usePopularAuthors";
import { usePopularTags } from "@/hooks/usePopularTags";
import type { PopularTagItem } from "@/hooks/usePopularTags";
import { usePublicBlogs } from "@/hooks/usePublicBlogs";

const MOST_DISCUSSED_LIMIT = 5;

export default function CommunityHighlights() {
    const { authors, loading: authorsLoading, error: authorsError } = usePopularAuthors(6);
    const { tags, loading: tagsLoading, error: tagsError } = usePopularTags(9);
    const { blogs: discussedBlogs, loading: discussedLoading, error: discussedError } = usePublicBlogs(
        MOST_DISCUSSED_LIMIT,
        "discussed"
    );

    return (
        <section className="bg-muted/20 py-8 sm:py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* ── Popular Authors ── */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold tracking-tight text-foreground">
                                Popular authors
                            </h2>
                            <Link
                                to="/authors"
                                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                            >
                                View all
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>

                        {authorsLoading && (
                            <div className="mt-4 flex flex-col gap-2.5">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
                                ))}
                            </div>
                        )}
                        {authorsError && (
                            <p className="mt-4 text-sm text-destructive" role="alert">{authorsError}</p>
                        )}
                        {!authorsLoading && !authorsError && authors.length === 0 && (
                            <p className="mt-4 text-sm text-muted-foreground">No authors yet.</p>
                        )}
                        {!authorsLoading && !authorsError && authors.length > 0 && (
                            <div className="mt-4 flex flex-col gap-2.5">
                                {authors.map((author) => (
                                    <Link
                                        key={author.id}
                                        to={`/authors/${author.slug}`}
                                        className="group flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-border/50 transition-all duration-200 hover:shadow-sm"
                                    >
                                        <img
                                            src={author.avatar}
                                            alt={author.name}
                                            className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border/50"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold text-foreground truncate">
                                                {author.name}
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                                                {author.bio || "Writer"}
                                            </p>
                                            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                                                <span className="flex items-center gap-0.5">
                                                    <FileText className="size-3" />
                                                    {author.posts} {author.posts === 1 ? "post" : "posts"}
                                                </span>
                                                {author.followers > 0 && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Users className="size-3" />
                                                        {author.followers.toLocaleString()} followers
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Most Discussed ── */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold tracking-tight text-foreground">
                                Most discussed
                            </h2>
                            <Link
                                to="/blogs?sort=discussed"
                                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                            >
                                View all
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>

                        {discussedLoading && (
                            <div className="mt-4 flex flex-col gap-2.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" aria-hidden />
                                ))}
                            </div>
                        )}
                        {discussedError && (
                            <p className="mt-4 text-xs text-muted-foreground" role="alert">{discussedError}</p>
                        )}
                        {!discussedLoading && !discussedError && discussedBlogs.length === 0 && (
                            <p className="mt-4 text-xs text-muted-foreground">No posts yet.</p>
                        )}
                        {!discussedLoading && !discussedError && discussedBlogs.length > 0 && (
                            <div className="mt-4 flex flex-col gap-2.5">
                                {discussedBlogs.map((blog, index) => (
                                    <Link
                                        key={blog.id}
                                        to={`/blogs/${blog.slug}`}
                                        className="group flex items-start gap-3 rounded-xl bg-card p-3 ring-1 ring-border/50 transition-all duration-200 hover:shadow-sm"
                                    >
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            {blog.category && (
                                                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                                    {blog.category}
                                                </span>
                                            )}
                                            <h3 className="mt-1 text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                {blog.title}
                                            </h3>
                                            <div className="mt-1.5 flex items-center gap-2">
                                                <img
                                                    src={blog.authorAvatar}
                                                    alt={blog.author}
                                                    className="size-4 rounded-full object-cover"
                                                />
                                                <span className="text-[11px] text-muted-foreground">
                                                    {blog.author}
                                                </span>
                                                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-primary">
                                                    <MessageCircle className="size-3" />
                                                    {blog.comments}
                                                </span>
                                                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                                                    <ThumbsUp className="size-3" />
                                                    {blog.likes}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Popular Tags ── */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold tracking-tight text-foreground">
                                Popular tags
                            </h2>
                            <Link
                                to="/blogs"
                                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                            >
                                View all
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </div>

                        {tagsLoading && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {Array.from({ length: 6 }, (_, i) => (
                                    <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-muted/50" aria-hidden />
                                ))}
                            </div>
                        )}
                        {tagsError && (
                            <p className="mt-4 text-xs text-muted-foreground" role="alert">{tagsError}</p>
                        )}
                        {!tagsLoading && !tagsError && tags.length === 0 && (
                            <p className="mt-4 text-xs text-muted-foreground">No tags yet.</p>
                        )}
                        {!tagsLoading && !tagsError && tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {tags.map((tag: PopularTagItem) => (
                                    <Link
                                        key={tag.slug}
                                        to={`/tags/${tag.slug}`}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs ring-1 ring-border/50 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:ring-primary/30"
                                    >
                                        #{tag.name}
                                        <span className="text-[10px] opacity-50">{tag.count}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
