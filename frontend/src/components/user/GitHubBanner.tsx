import { Github } from "lucide-react";

const GITHUB_REPO_URL = "https://github.com/can-web3/react-laravel-blogapp4";

export default function GitHubBanner() {
  return (
    <div
      className="flex items-center justify-center gap-2 border-b border-amber-200/60 bg-amber-50 py-2.5 text-center text-sm text-amber-900/90"
      role="banner"
    >
      <Github className="size-4 shrink-0 text-amber-700/80" />
      <span>GitHub&apos;ta incelemek için</span>
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-blue-600 underline decoration-blue-600/70 underline-offset-2 transition-colors hover:text-blue-700 hover:decoration-blue-700"
        aria-label="GitHub deposunu aç"
      >
        tıklayınız
      </a>
    </div>
  );
}
