import { useCallback, useEffect, useState } from "react";
import { axiosGuest } from "@/lib/axiosGuest";
import type { BlogItem } from "@/contexts/BlogsContext";

interface BlogBySlugState {
  blog: BlogItem | null;
  loading: boolean;
  error: string | null;
}

export function useBlogBySlug(slug: string | undefined): BlogBySlugState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<BlogBySlugState>({
    blog: null,
    loading: !!slug,
    error: null,
  });

  const fetchBlog = useCallback(async () => {
    if (!slug) {
      setState({ blog: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await axiosGuest.get<{ success: boolean; data: BlogItem }>(
        `/blogs/${encodeURIComponent(slug)}`
      );
      setState({
        blog: res.data?.data ?? null,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      const status = err && typeof err === "object" && "response" in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;
      setState({
        blog: null,
        loading: false,
        error: status === 404 ? "not_found" : "Failed to load blog",
      });
    }
  }, [slug]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  return { ...state, refetch: fetchBlog };
}
