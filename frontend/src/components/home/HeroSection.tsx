import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const heroBgImage =
  "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1920&q=80";

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b"
      aria-labelledby="hero-heading"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBgImage})` }}
        aria-hidden
      />
      {/* Overlay for text readability */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"
        aria-hidden
      />

      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 md:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            id="hero-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Stories & ideas for everyone
          </h1>
          <p className="mt-4 text-lg text-white/90 sm:mt-6 sm:text-xl">
            Discover articles, guides, and inspiration. Read, share, and join
            the conversation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="gap-2 rounded-full px-6">
              <Link to="/blogs">
                <BookOpen className="size-5" />
                Explore blogs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
