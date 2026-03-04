import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Menu,
  ChevronLeft,
  ChevronDown,
  Search,
  Bell,
  LogOut,
  FolderTree,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";

const navMain = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
];

const navContent = [
  { to: "/admin/posts", end: false, icon: FileText, label: "Posts" },
  { to: "/admin/categories", end: false, icon: FolderTree, label: "Categories" },
  { to: "/admin/tags", end: false, icon: Tag, label: "Tags" },
];

const navSystem = [
  { to: "/admin/users", end: false, icon: Users, label: "Users" },
];

function NavGroup({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: { to: string; end: boolean; icon: typeof FileText; label: string }[];
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {items.map(({ to, end, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <Icon className="size-5 shrink-0" />
          {label}
        </NavLink>
      ))}
    </div>
  );
}

function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
        <Link
          to="/admin"
          className="flex items-center gap-2 font-semibold text-foreground"
          onClick={onNavigate}
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            B
          </span>
          Blog Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        <NavGroup title="Main" items={navMain} onNavigate={onNavigate} />
        <NavGroup title="Content" items={navContent} onNavigate={onNavigate} />
        <NavGroup title="System" items={navSystem} onNavigate={onNavigate} />
      </nav>
      <div className="border-t border-border p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={onNavigate}
        >
          <ChevronLeft className="size-5 shrink-0" />
          Back to site
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  useGoogleAnalytics();

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isInitialized, isAuthenticated, user, logout } = useAuth();
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes("admin");

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || !user || !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isInitialized, isAuthenticated, user, isAdmin, navigate]);

  if (!isInitialized || !isAuthenticated || !user || !isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <ScrollToTop />
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <AdminSidebarContent />
      </aside>

      {/* Mobile: menu button + sheet + notification + user */}
      <div className="fixed left-0 top-0 z-40 flex w-full items-center gap-2 border-b border-border bg-card px-4 py-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" showCloseButton={true}>
            <AdminSidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="font-semibold text-foreground">Blog Admin</span>
        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="border-b border-border px-3 py-2">
                <p className="font-semibold text-foreground text-sm">
                  Notifications
                </p>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {[
                  {
                    id: "1",
                    title: "New comment on your post",
                    text: 'Jamie Smith commented on "Modern Web Development"',
                    time: "5 min ago",
                  },
                  {
                    id: "2",
                    title: "Post published",
                    text: '"Design systems that scale" is now live.',
                    time: "1 hour ago",
                  },
                  {
                    id: "3",
                    title: "New follower",
                    text: "Sam Taylor started following you.",
                    time: "2 hours ago",
                  },
                  {
                    id: "4",
                    title: "Weekly digest ready",
                    text: "Your blog stats for this week are ready.",
                    time: "1 day ago",
                  },
                ].map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className="flex w-full flex-col gap-0.5 border-b border-border/50 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 last:border-0"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {n.title}
                    </span>
                    <span className="text-muted-foreground text-xs line-clamp-2">
                      {n.text}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {n.time}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-border p-2">
                <Button variant="ghost" size="sm" className="w-full text-sm">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full p-0.5"
                aria-label="User menu"
              >
                <img
                  src={user?.image ?? "https://i.pravatar.cc/150?u=user"}
                  alt={user?.username ?? "User"}
                  className="size-8 rounded-full object-cover ring-2 ring-border"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <img
                  src={user?.image ?? "https://i.pravatar.cc/150?u=user"}
                  alt=""
                  className="size-9 rounded-full object-cover ring-2 ring-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user?.username ?? "User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email ?? ""}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/" className="gap-2">
                  <ChevronLeft className="size-4" />
                  View site
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onSelect={handleLogout}
              >
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main: top bar + content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top header bar (desktop) */}
        <header className="sticky top-0 z-30 hidden h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-6 md:flex">
          <div className="flex flex-1 items-center gap-4">
            <label className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search posts, users..."
                className="h-9 w-full rounded-md border border-input bg-background py-1.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Search"
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="border-b border-border px-3 py-2">
                  <p className="font-semibold text-foreground text-sm">
                    Notifications
                  </p>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {[
                    {
                      id: "1",
                      title: "New comment on your post",
                      text: "Jamie Smith commented on “Modern Web Development”",
                      time: "5 min ago",
                    },
                    {
                      id: "2",
                      title: "Post published",
                      text: "“Design systems that scale” is now live.",
                      time: "1 hour ago",
                    },
                    {
                      id: "3",
                      title: "New follower",
                      text: "Sam Taylor started following you.",
                      time: "2 hours ago",
                    },
                    {
                      id: "4",
                      title: "Weekly digest ready",
                      text: "Your blog stats for this week are ready.",
                      time: "1 day ago",
                    },
                  ].map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className="flex w-full flex-col gap-0.5 border-b border-border/50 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 last:border-0"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {n.title}
                      </span>
                      <span className="text-muted-foreground text-xs line-clamp-2">
                        {n.text}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {n.time}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-border p-2">
                  <Button variant="ghost" size="sm" className="w-full text-sm">
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center gap-2 rounded-full p-0.5 pr-2"
                  aria-label="User menu"
                >
                  <img
                    src={user?.image ?? "https://i.pravatar.cc/150?u=user"}
                    alt={user?.username ?? "User"}
                    className="size-8 rounded-full object-cover ring-2 ring-border"
                  />
                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-foreground lg:inline">
                    {user?.username ?? "User"}
                  </span>
                  <ChevronDown className="size-4 hidden shrink-0 text-muted-foreground lg:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <img
                    src={user?.image ?? "https://i.pravatar.cc/150?u=user"}
                    alt=""
                    className="size-9 rounded-full object-cover ring-2 ring-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {user?.username ?? "User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email ?? ""}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="gap-2">
                    <ChevronLeft className="size-4" />
                    View site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onSelect={handleLogout}
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 pt-14 md:p-6 md:pt-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
