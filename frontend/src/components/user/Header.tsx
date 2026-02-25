import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  PenSquare,
  Home,
  BookOpen,
  FolderOpen,
  LogIn,
  UserPlus,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useBlogSearchSuggestions } from "@/hooks/useBlogSearchSuggestions";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Blogs", href: "/blogs", icon: BookOpen },
  { name: "Categories", href: "", icon: FolderOpen },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { categories } = useCategories();
  const { results: searchResults, loading: searchLoading } = useBlogSearchSuggestions(searchQuery);
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes("admin");

  const showDropdown = searchQuery.trim().length > 0 && searchOpen;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const inside =
        desktopSearchRef.current?.contains(target) || mobileSearchRef.current?.contains(target);
      if (!inside) setSearchOpen(false);
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const goToBlog = (slug: string) => {
    setSearchQuery("");
    setSearchOpen(false);
    setIsOpen(false);
    navigate(`/blogs/${slug}`);
  };

  return (
    <header className="w-full border-b bg-background">
      <div className="container mx-auto px-4">
        {/* Top row: logo, search (desktop), nav (desktop), auth (desktop), menu toggle (mobile) */}
        <div className="flex h-14 min-h-14 items-center justify-between gap-4 sm:h-16 sm:min-h-16">
          <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6">
            <Link
              to="/"
              className="flex shrink-0 items-center gap-2 font-bold text-xl text-primary transition-colors hover:text-primary/80"
            >
              <PenSquare className="size-6" />
              <span className="hidden sm:inline">BlogApp</span>
            </Link>

            <form
              onSubmit={handleSearch}
              className="hidden flex-1 min-w-0 lg:flex"
            >
              <div ref={desktopSearchRef} className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="h-10 w-full min-w-0 rounded-full border-0 bg-muted/50 pl-10 pr-4 py-2 focus-visible:ring-1 focus-visible:ring-primary/50"
                  autoComplete="off"
                  aria-expanded={showDropdown}
                  aria-controls="header-search-results-desktop"
                  aria-autocomplete="list"
                  id="header-search-desktop"
                />
                {showDropdown && (
                  <ul
                    id="header-search-results-desktop"
                    role="listbox"
                    className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[min(20rem,60vh)] overflow-auto rounded-lg border border-border bg-popover shadow-md py-1"
                  >
                    {searchLoading && (
                      <li className="px-3 py-4 text-center text-sm text-muted-foreground" role="option">
                        Searching…
                      </li>
                    )}
                    {!searchLoading && searchResults.length === 0 && (
                      <li className="px-3 py-4 text-center text-sm text-muted-foreground" role="option">
                        No blogs found
                      </li>
                    )}
                    {!searchLoading &&
                      searchResults.map((blog) => (
                        <li key={blog.slug} role="option">
                          <button
                            type="button"
                            onClick={() => goToBlog(blog.slug)}
                            className="w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                          >
                            <span className="line-clamp-2">{blog.title}</span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </form>
          </div>

          <nav className="hidden items-center gap-1 shrink-0 lg:flex">
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActiveLink("/admin")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <LayoutDashboard className="size-4 shrink-0" />
                Admin panel
              </Link>
            )}
            {navLinks.map((link) => {
              const Icon = link.icon;
              if (link.name === "Categories") {
                return (
                  <HoverCard key={link.name} openDelay={150} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                          "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <Icon className="size-4 shrink-0" />
                        {link.name}
                        <ChevronDown className="size-4 shrink-0 opacity-70" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent side="bottom" align="start" className="w-56 p-0">
                      <div className="p-2">
                        <ul className="py-1">
                          {categories.map((category) => (
                            <li key={category.id}>
                              <Link
                                to={`/categories/${category.slug}`}
                                className="block rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                {category.name}
                              </Link>
                            </li>
                          ))}
                          {categories.length === 0 && (
                            <li className="px-2 py-2 text-sm text-muted-foreground">
                              No categories
                            </li>
                          )}
                        </ul>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                );
              }
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    isActiveLink(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      aria-label="User menu"
                    >
                      <img
                        src={user.image ?? ""}
                        alt=""
                        className="size-8 shrink-0 rounded-full object-cover ring-1 ring-border"
                      />
                      <span className="font-medium">{user.username}</span>
                      <ChevronDown className="size-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="size-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                          <LayoutDashboard className="size-4" />
                          Admin panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => logout()}
                      className="cursor-pointer"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild size="sm">
                    <Link to="/login" className="flex items-center gap-2">
                      <LogIn className="size-4" />
                      Login
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/register" className="flex items-center gap-2">
                      <UserPlus className="size-4" />
                      Register
                    </Link>
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsOpen((o) => !o)}
            >
              {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile: expand down (links + search + auth) */}
        <div
          className={cn(
            "grid overflow-hidden border-t border-border bg-background transition-[grid-template-rows] duration-200 ease-out lg:hidden",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="min-h-0">
            <div className="flex flex-col gap-4 py-4">
              <form onSubmit={handleSearch} className="px-0">
                <div ref={mobileSearchRef} className="relative">
                  <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search blogs..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    className="w-full rounded-full border bg-muted/50 pl-10 pr-4 py-2 focus-visible:ring-1 focus-visible:ring-primary/50"
                    autoComplete="off"
                    aria-expanded={showDropdown}
                    aria-controls="header-search-results-mobile"
                    aria-autocomplete="list"
                    id="header-search-mobile"
                  />
                  {showDropdown && (
                    <ul
                      id="header-search-results-mobile"
                      role="listbox"
                      className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[min(20rem,50vh)] overflow-auto rounded-lg border border-border bg-popover shadow-md py-1"
                    >
                      {searchLoading && (
                        <li className="px-3 py-4 text-center text-sm text-muted-foreground" role="option">
                          Searching…
                        </li>
                      )}
                      {!searchLoading && searchResults.length === 0 && (
                        <li className="px-3 py-4 text-center text-sm text-muted-foreground" role="option">
                          No blogs found
                        </li>
                      )}
                      {!searchLoading &&
                        searchResults.map((blog) => (
                          <li key={blog.slug} role="option">
                            <button
                              type="button"
                              onClick={() => goToBlog(blog.slug)}
                              className="w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                            >
                              <span className="line-clamp-2">{blog.title}</span>
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </form>

              <nav className="flex flex-col gap-0.5">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActiveLink("/admin")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <LayoutDashboard className="size-5 shrink-0" />
                    Admin panel
                  </Link>
                )}
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  if (link.name === "Categories") {
                    return (
                      <div key={link.name} className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground"
                          )}
                        >
                          <Icon className="size-5 shrink-0" />
                          {link.name}
                        </span>
                        <ul className="ml-6 flex flex-col gap-0.5 border-l border-border pl-3">
                          {categories.map((category) => (
                            <li key={category.id}>
                              <Link
                                to={`/categories/${category.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                              >
                                {category.name}
                              </Link>
                            </li>
                          ))}
                          {categories.length === 0 && (
                            <li className="px-2 py-1.5 text-sm text-muted-foreground">
                              No categories
                            </li>
                          )}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActiveLink(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex flex-col gap-2 border-t border-border pt-4">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <img
                        src={user.image ?? ""}
                        alt=""
                        className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                      />
                      <p className="text-sm font-medium text-foreground">
                        {user.username}
                      </p>
                    </div>
                    <Button variant="outline" asChild size="sm" className="w-full">
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2"
                      >
                        <User className="size-4" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="size-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild size="sm" className="w-full">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2"
                      >
                        <LogIn className="size-4" />
                        Login
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="w-full">
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2"
                      >
                        <UserPlus className="size-4" />
                        Register
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
