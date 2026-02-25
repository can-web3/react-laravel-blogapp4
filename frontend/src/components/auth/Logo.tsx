import { Link } from "react-router-dom";
import { PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Use "light" on dark backgrounds (e.g. primary panel) */
  variant?: "default" | "light";
}

export default function Logo({ className, variant = "default" }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center gap-2 font-bold text-xl transition-colors",
        variant === "light"
          ? "text-primary-foreground/90 hover:text-primary-foreground"
          : "text-primary hover:text-primary/80",
        className
      )}
    >
      <PenSquare
        className="shrink-0"
        style={{ width: "var(--auth-logo-icon-size)", height: "var(--auth-logo-icon-size)" }}
      />
      BlogApp
    </Link>
  );
}
