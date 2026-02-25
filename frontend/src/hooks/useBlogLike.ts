import { useCallback, useEffect, useState } from "react";
import { axiosGuest } from "@/lib/axiosGuest";
import { useAuth } from "@/contexts/AuthContext";

interface UseBlogLikeOptions {
  likeCount: number;
  userHasLiked: boolean;
}

export function useBlogLike(
  slug: string | undefined,
  options: UseBlogLikeOptions
): {
  likeCount: number;
  userHasLiked: boolean;
  toggleLike: () => Promise<void>;
  loading: boolean;
  error: string | null;
} {
  const { token } = useAuth();
  const [likeCount, setLikeCount] = useState(options.likeCount);
  const [userHasLiked, setUserHasLiked] = useState(options.userHasLiked);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLikeCount(options.likeCount);
    setUserHasLiked(options.userHasLiked);
  }, [options.likeCount, options.userHasLiked]);

  const toggleLike = useCallback(async () => {
    if (!slug) return;

    if (!token?.trim()) {
      setError("Please log in to like this post.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await axiosGuest.post<{
        success: boolean;
        data: { liked: boolean; like_count: number };
      }>(`/blogs/${encodeURIComponent(slug)}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { liked, like_count } = res.data?.data ?? {};
      setUserHasLiked(!!liked);
      setLikeCount(typeof like_count === "number" ? like_count : likeCount + (liked ? 1 : -1));
    } catch {
      setError("Failed to update like.");
    } finally {
      setLoading(false);
    }
  }, [slug, token, likeCount]);

  return { likeCount, userHasLiked, toggleLike, loading, error };
}
