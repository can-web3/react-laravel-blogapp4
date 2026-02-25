import { useCallback, useEffect, useState } from "react";
import { axiosGuest } from "@/lib/axiosGuest";
import { useAuth } from "@/contexts/AuthContext";

interface UseBlogBookmarkOptions {
  bookmarkCount: number;
  userHasBookmarked: boolean;
}

export function useBlogBookmark(
  slug: string | undefined,
  options: UseBlogBookmarkOptions
): {
  bookmarkCount: number;
  userHasBookmarked: boolean;
  toggleBookmark: () => Promise<void>;
  loading: boolean;
  error: string | null;
} {
  const { token } = useAuth();
  const [bookmarkCount, setBookmarkCount] = useState(options.bookmarkCount);
  const [userHasBookmarked, setUserHasBookmarked] = useState(options.userHasBookmarked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBookmarkCount(options.bookmarkCount);
    setUserHasBookmarked(options.userHasBookmarked);
  }, [options.bookmarkCount, options.userHasBookmarked]);

  const toggleBookmark = useCallback(async () => {
    if (!slug) return;

    if (!token?.trim()) {
      setError("Please log in to bookmark this post.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await axiosGuest.post<{
        success: boolean;
        data: { bookmarked: boolean; bookmark_count: number };
      }>(`/blogs/${encodeURIComponent(slug)}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { bookmarked, bookmark_count } = res.data?.data ?? {};
      setUserHasBookmarked(!!bookmarked);
      setBookmarkCount(typeof bookmark_count === "number" ? bookmark_count : bookmarkCount + (bookmarked ? 1 : -1));
    } catch {
      setError("Failed to update bookmark.");
    } finally {
      setLoading(false);
    }
  }, [slug, token, bookmarkCount]);

  return { bookmarkCount, userHasBookmarked, toggleBookmark, loading, error };
}
