import { useCallback, useEffect, useState } from "react";
import { axiosGuest } from "@/lib/axiosGuest";

export interface PopularTagItem {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface PopularTagsState {
  tags: PopularTagItem[];
  loading: boolean;
  error: string | null;
}

export function usePopularTags(limit = 9): PopularTagsState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<PopularTagsState>({
    tags: [],
    loading: true,
    error: null,
  });

  const fetchTags = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      const res = await axiosGuest.get<{ success: boolean; data: PopularTagItem[] }>(
        `/tags/popular?${params}`
      );
      setState({
        tags: res.data?.data ?? [],
        loading: false,
        error: null,
      });
    } catch {
      setState({
        tags: [],
        loading: false,
        error: "Failed to load tags",
      });
    }
  }, [limit]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { ...state, refetch: fetchTags };
}
