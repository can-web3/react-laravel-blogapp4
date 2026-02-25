import { Link } from "react-router-dom";
import {
  PenSquare,
  Home,
  BookOpen,
  FolderOpen,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Blogs", href: "/blogs", icon: BookOpen },
  { name: "Categories", href: "/categories", icon: FolderOpen },
];

const footerCategories = [
  "Technology",
  "Design",
  "Lifestyle",
  "Travel",
  "Food",
  "AI",
];

const footerTags = [
  "React",
  "TypeScript",
  "CSS",
  "Figma",
  "Remote",
  "API",
  "UI",
  "Wellness",
];

const socialLinks = [
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo + description + links + social */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="flex w-fit items-center gap-2 font-bold text-xl text-primary transition-colors hover:text-primary/80"
            >
              <PenSquare className="size-6" />
              BlogApp
            </Link>
            <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">
              Stories and ideas for everyone. Discover articles, share thoughts,
              and join the conversation.
            </p>
            <nav
              className="flex flex-wrap gap-x-5 gap-y-1"
              aria-label="Footer navigation"
            >
              {footerLinks.map(({ name, href, icon: Icon }) => (
                <Link
                  key={name}
                  to={href}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="size-3.5" />
                  {name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="font-semibold text-foreground">Categories</h3>
            <ul className="mt-4 space-y-2">
              {footerCategories.map((name) => (
                <li key={name}>
                  <Link
                    to={`/categories/${name.toLowerCase()}`}
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Tags */}
          <div>
            <h3 className="font-semibold text-foreground">Tags</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {footerTags.map((tag) => (
                <Link
                  key={tag}
                  to={`/tags/${tag.toLowerCase()}`}
                  className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Subscribe */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-foreground">Subscribe</h3>
            <p className="mt-2 text-muted-foreground text-sm">
              Get the latest posts and updates delivered to your inbox.
            </p>
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Your email"
                className="min-w-0 rounded-full border-border bg-background"
                aria-label="Email for newsletter"
              />
              <Button type="submit" size="sm" className="shrink-0 rounded-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-muted-foreground text-sm">
            © {currentYear} BlogApp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
