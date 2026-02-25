import HeroSection from "@/components/home/HeroSection";
import TrendingBlogs from "@/components/home/TrendingBlogs";
import LatestBlogs from "@/components/home/LatestBlogs";
import CommunityHighlights from "@/components/home/CommunityHighlights";
import { PageSEO } from "@/components/PageSEO";
import { SITE_NAME, SITE_TAGLINE, DEFAULT_META_DESCRIPTION } from "@/lib/siteConfig";

export default function Home() {
  return (
    <main>
      <PageSEO
        title={`${SITE_NAME} — ${SITE_TAGLINE}`}
        description={DEFAULT_META_DESCRIPTION}
        canonicalPath="/"
      />
      <HeroSection />
      <TrendingBlogs />
      <LatestBlogs />
      <CommunityHighlights />
    </main>
  );
}
