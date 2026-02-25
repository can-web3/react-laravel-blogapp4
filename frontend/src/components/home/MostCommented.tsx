import { Link } from "react-router-dom";
import { MessageCircle, ThumbsUp, BookmarkCheck } from "lucide-react";

const mostCommentedBlogs = [
  {
    id: "1",
    title: "Is AI going to replace developers? A realistic perspective",
    excerpt:
      "An honest discussion about AI in software development and what it means for your career.",
    category: "AI",
    slug: "ai-replace-developers",
    author: "Avery Patel",
    authorAvatar: "https://i.pravatar.cc/150?u=averypatel",
    likes: 342,
    comments: 187,
    bookmarks: 124,
    publishedAt: "Feb 8, 2025",
  },
  {
    id: "2",
    title: "Tabs vs spaces: the debate that never ends",
    excerpt:
      "We surveyed 10,000 developers. The results might surprise you.",
    category: "Technology",
    slug: "tabs-vs-spaces",
    author: "Alex Chen",
    authorAvatar: "https://i.pravatar.cc/150?u=alexchen",
    likes: 289,
    comments: 156,
    bookmarks: 45,
    publishedAt: "Feb 6, 2025",
  },
  {
    id: "3",
    title: "Why I switched from React to Vue (and back again)",
    excerpt:
      "A candid journey through JavaScript frameworks and the lessons learned.",
    category: "Technology",
    slug: "react-to-vue-and-back",
    author: "Taylor Kim",
    authorAvatar: "https://i.pravatar.cc/150?u=taylorkim",
    likes: 198,
    comments: 134,
    bookmarks: 67,
    publishedAt: "Feb 5, 2025",
  },
  {
    id: "4",
    title: "Remote work is broken — here is how to fix it",
    excerpt:
      "After 5 years of remote work, here are the biggest challenges and real solutions.",
    category: "Lifestyle",
    slug: "remote-work-broken-fix",
    author: "Jordan Lee",
    authorAvatar: "https://i.pravatar.cc/150?u=jordanlee",
    likes: 256,
    comments: 118,
    bookmarks: 89,
    publishedAt: "Feb 4, 2025",
  },
  {
    id: "5",
    title: "The best VS Code extensions in 2024",
    excerpt:
      "Our community-curated list of must-have extensions for every developer.",
    category: "Technology",
    slug: "best-vscode-extensions-2024",
    author: "Morgan Taylor",
    authorAvatar: "https://i.pravatar.cc/150?u=morgantaylor",
    likes: 412,
    comments: 97,
    bookmarks: 231,
    publishedAt: "Feb 2, 2025",
  },
];

export default function MostCommented() {
  return (
    <section className="border-b bg-background py-16 sm:py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Most discussed
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Posts sparking the biggest conversations
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mostCommentedBlogs.slice(0, 6).map((blog, index) => (
            <Link
              key={blog.id}
              to={`/blogs/${blog.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-border/50 transition-all duration-200 hover:shadow-md hover:ring-border"
            >
              <div className="flex items-center gap-3 border-b border-border/50 bg-muted/30 px-4 py-2.5">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {blog.category}
                </span>
                <span className="ml-auto flex items-center gap-1 text-muted-foreground text-xs font-medium">
                  <MessageCircle className="size-3.5" />
                  {blog.comments}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <h3 className="font-semibold text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                  {blog.title}
                </h3>
                <p className="mt-2 flex-1 text-muted-foreground text-sm line-clamp-2">
                  {blog.excerpt}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={blog.authorAvatar}
                      alt={blog.author}
                      className="size-5 rounded-full object-cover ring-1 ring-border/50"
                    />
                    <span>{blog.author}</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="size-3.5" />
                    {blog.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookmarkCheck className="size-3.5" />
                    {blog.bookmarks}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
