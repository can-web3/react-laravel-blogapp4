import { Link } from "react-router-dom";
import {
    Calendar,
    MessageCircle,
    ThumbsUp,
    BookmarkCheck,
} from "lucide-react";

export default function BlogCard({
  blog,
  noList,
}: {
  blog: any;
  noList?: boolean;
}) {
  const categoryHref = blog.categorySlug ?? (typeof blog.category === "string" ? blog.category.toLowerCase() : "");
  const categoryPillClass =
    "absolute left-2 top-2 z-10 rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm";
  const categoryEl = noList ? (
    <span className={`${categoryPillClass} bg-primary/90 text-primary-foreground`}>
      {blog.category}
    </span>
  ) : categoryHref ? (
    <Link
      to={`/categories/${categoryHref}`}
      onClick={(e) => e.stopPropagation()}
      className={`${categoryPillClass} bg-primary/90 text-primary-foreground transition-opacity hover:opacity-90`}
    >
      {blog.category}
    </Link>
  ) : (
    <span className={`${categoryPillClass} bg-primary/90 text-primary-foreground`}>
      {blog.category}
    </span>
  );
  const tagLabel = (t: string | { name: string; slug: string }) =>
    typeof t === "string" ? t : t.name;
  const tagSlug = (t: string | { name: string; slug: string }) =>
    typeof t === "string" ? t.toLowerCase() : t.slug;
  const tagEl = (tag: string | { name: string; slug: string }) => {
    const label = tagLabel(tag);
    const slug = tagSlug(tag);
    const key = typeof tag === "string" ? tag : tag.slug;
    return noList ? (
      <span
        key={key}
        className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
      >
        # {label}
      </span>
    ) : (
      <Link
        key={key}
        to={`/tags/${slug}`}
        className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
      >
        # {label}
      </Link>
    );
  };

  const content = (
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card p-4 shadow-md ring-1 ring-border/50 transition-shadow duration-200 hover:shadow-lg sm:p-5">
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl">
                    <Link
                        to={`/blogs/${blog.slug}`}
                        className="block size-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset focus:ring-offset-0 rounded-xl"
                    >
                        <img
                            src={blog.image}
                            alt={blog.title}
                            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                    </Link>
                    {categoryEl}
                </div>

                <div className="mt-4 flex flex-1 flex-col sm:mt-5">
                    <div className="flex flex-wrap gap-1.5">
                        {blog.tags.map(tagEl)}
                    </div>

                    <h3 className="mt-2 font-semibold leading-tight text-foreground line-clamp-2">
                        <Link to={`/blogs/${blog.slug}`} className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                            {blog.title}
                        </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-muted-foreground text-sm line-clamp-2">
                        {blog.excerpt}
                    </p>

                    {/* Author & date */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2">
                            <img
                                src={blog.authorAvatar}
                                alt={blog.author}
                                className="size-6 rounded-full object-cover ring-1 ring-border/50"
                            />
                            <p className="text-muted-foreground text-xs font-medium">
                                {blog.author}
                            </p>
                        </div>
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Calendar className="size-3.5" />
                            {blog.publishedAt ?? "Mar 15, 2024"}
                        </span>
                    </div>

                    {/* Stats: likes, comments, bookmarks */}
                    <div className="mt-3 flex items-center gap-4 text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="size-3.5" />
                            {blog.likes}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageCircle className="size-3.5" />
                            {blog.comments}
                        </span>
                        <span className="flex items-center gap-1">
                            <BookmarkCheck className="size-3.5" />
                            {blog.bookmarks}
                        </span>
                    </div>
                </div>
            </article>
  );
  if (noList) return content;
  return <li key={blog.id}>{content}</li>;
}