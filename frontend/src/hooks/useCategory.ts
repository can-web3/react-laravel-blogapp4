import { useCallback, useEffect, useState } from "react";
import { axiosGuest } from "@/lib/axiosGuest";

export interface CategoryPublic {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface CategoryBySlugState {
  category: CategoryPublic | null;
  loading: boolean;
  error: string | null;
}

export function useCategoryBySlug(
  slug: string | undefined
): CategoryBySlugState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<CategoryBySlugState>({
    category: null,
    loading: !!slug,
    error: null,
  });

  const fetchCategory = useCallback(async () => {
    if (!slug) {
      setState({ category: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await axiosGuest.get<{ success: boolean; data: CategoryPublic }>(
        `/categories/${encodeURIComponent(slug)}`
      );
      setState({
        category: res.data?.data ?? null,
        loading: false,
        error: null,
      });
    } catch {
      setState({
        category: null,
        loading: false,
        error: "Category not found",
      });
    }
  }, [slug]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return { ...state, refetch: fetchCategory };
}
