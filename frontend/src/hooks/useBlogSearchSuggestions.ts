import { useCallback, useEffect, useState } from "react";
import { axiosGuest } from "@/lib/axiosGuest";
import type { BlogItem } from "@/contexts/BlogsContext";

const HEADER_SEARCH_LIMIT = 6;

export interface BlogSearchSuggestion {
  slug: string;
  title: string;
}

interface State {
  results: BlogSearchSuggestion[];
  loading: boolean;
}

export function useBlogSearchSuggestions(query: string): State {
  const [state, setState] = useState<State>({ results: [], loading: false });
  const term = query.trim();

  const fetchSuggestions = useCallback(async () => {
    if (term.length === 0) {
      setState({ results: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    try {
      const params = new URLSearchParams({
        search: term,
        per_page: String(HEADER_SEARCH_LIMIT),
        sort: "latest",
      });
      const res = await axiosGuest.get<{ success: boolean; data: BlogItem[] }>(
        `/blogs?${params}`
      );
      const items = res.data?.data ?? [];
      setState({
        results: items.map((b) => ({ slug: b.slug, title: b.title })),
        loading: false,
      });
    } catch {
      setState({ results: [], loading: false });
    }
  }, [term]);

  useEffect(() => {
    if (term.length === 0) {
      setState({ results: [], loading: false });
      return;
    }
    const t = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(t);
  }, [term, fetchSuggestions]);

  return state;
}
