import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  MessageCircle,
  FolderTree,
  Plus,
  ExternalLink,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { axiosGuest } from "@/lib/axiosGuest";

interface StatsData {
  total_blogs: number;
  published_blogs: number;
  draft_blogs: number;
  blogs_this_week: number;
  total_users: number;
  users_this_week: number;
  total_comments: number;
  comments_this_week: number;
  total_categories: number;
  total_tags: number;
}

interface RecentBlog {
  id: number;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  user: { id: number; username: string } | null;
  category: { id: number; name: string; slug: string } | null;
}

interface DashboardData {
  stats: StatsData;
  recent_blogs: RecentBlog[];
}

type LoadState = "idle" | "loading" | "success" | "error";

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoadState("loading");
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await axiosGuest.get("/admin/stats", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setData(response.data.data);
      setLoadState("success");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to load dashboard data";
      setError(message);
      setLoadState("error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = data?.stats;

  const statCards = stats
    ? [
        {
          label: "Total Posts",
          value: formatNumber(stats.total_blogs),
          change: `+${stats.blogs_this_week} this week`,
          icon: FileText,
          className: "bg-primary/10 text-primary",
        },
        {
          label: "Users",
          value: formatNumber(stats.total_users),
          change: `+${stats.users_this_week} this week`,
          icon: Users,
          className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Comments",
          value: formatNumber(stats.total_comments),
          change: `+${stats.comments_this_week} this week`,
          icon: MessageCircle,
          className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        },
        {
          label: "Categories",
          value: formatNumber(stats.total_categories),
          change: `${stats.total_tags} tags`,
          icon: FolderTree,
          className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Overview of your blog and content performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-2">
            <Link to="/admin/posts">
              <Plus className="size-4" />
              New post
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/">
              <ExternalLink className="size-4" />
              View site
            </Link>
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loadState === "loading" && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error state */}
      {loadState === "error" && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <AlertCircle className="size-12 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Success state */}
      {loadState === "success" && data && (
        <>
          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map(({ label, value, change, icon: Icon, className }) => (
              <div
                key={label}
                className="rounded-xl border bg-card p-5 shadow-sm ring-1 ring-border/50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm font-medium">
                    {label}
                  </p>
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      className
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {value}
                </p>
                <p className="mt-0.5 text-muted-foreground text-xs">{change}</p>
              </div>
            ))}
          </div>

          {/* Recent posts */}
          <div className="rounded-xl border bg-card shadow-sm ring-1 ring-border/50">
            <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <h2 className="text-lg font-semibold text-foreground">
                Recent posts
              </h2>
              <Button asChild variant="ghost" size="sm" className="gap-1.5 w-fit">
                <Link to="/admin/posts">
                  View all
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            {data.recent_blogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <FileText className="size-10 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">No posts yet</p>
                <Button asChild size="sm" className="mt-2 gap-2">
                  <Link to="/admin/posts">
                    <Plus className="size-4" />
                    Create your first post
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.recent_blogs.map((post) => (
                  <Link
                    key={post.id}
                    to={`/admin/posts`}
                    className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">
                        {post.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {post.user?.username ?? "Unknown"} ·{" "}
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium w-fit capitalize",
                        post.status === "published"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {post.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick stats summary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm ring-1 ring-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Content Summary
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Published posts</dt>
                  <dd className="font-medium text-foreground">
                    {stats?.published_blogs ?? 0}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Draft posts</dt>
                  <dd className="font-medium text-foreground">
                    {stats?.draft_blogs ?? 0}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total tags</dt>
                  <dd className="font-medium text-foreground">
                    {stats?.total_tags ?? 0}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm ring-1 ring-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                This Week
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">New posts</dt>
                  <dd className="font-medium text-foreground">
                    {stats?.blogs_this_week ?? 0}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">New users</dt>
                  <dd className="font-medium text-foreground">
                    {stats?.users_this_week ?? 0}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">New comments</dt>
                  <dd className="font-medium text-foreground">
                    {stats?.comments_this_week ?? 0}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
