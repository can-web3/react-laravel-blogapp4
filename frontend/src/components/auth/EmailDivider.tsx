export default function EmailDivider() {
  return (
    <div
      className="flex items-center my-6"
      style={{ gap: "var(--auth-divider-gap)" }}
    >
      <span className="flex-1 border-t border-border" aria-hidden />
      <span className="text-muted-foreground text-xs uppercase tracking-wider shrink-0">
        or continue with email
      </span>
      <span className="flex-1 border-t border-border" aria-hidden />
    </div>
  );
}
