import { useCallback, useEffect, useState } from "react";
import { axiosGuest } from "@/lib/axiosGuest";

export interface PopularAuthor {
  id: number;
  username: string;
  slug: string;
  name: string;
  avatar: string;
  bio: string;
  posts: number;
  followers: number;
}

interface PopularAuthorsState {
  authors: PopularAuthor[];
  loading: boolean;
  error: string | null;
}

export function usePopularAuthors(limit = 10): PopularAuthorsState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<PopularAuthorsState>({
    authors: [],
    loading: true,
    error: null,
  });

  const fetchAuthors = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      const res = await axiosGuest.get<{ success: boolean; data: PopularAuthor[] }>(
        `/authors?${params}`
      );
      setState({
        authors: res.data?.data ?? [],
        loading: false,
        error: null,
      });
    } catch {
      setState({
        authors: [],
        loading: false,
        error: "Failed to load authors",
      });
    }
  }, [limit]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  return { ...state, refetch: fetchAuthors };
}

export interface AuthorPublic {
  id: number;
  username: string;
  slug: string;
  name: string;
  avatar: string;
  bio: string;
  posts: number;
}

interface AuthorBySlugState {
  author: AuthorPublic | null;
  loading: boolean;
  error: string | null;
}

export function useAuthorBySlug(
  slug: string | undefined
): AuthorBySlugState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<AuthorBySlugState>({
    author: null,
    loading: !!slug,
    error: null,
  });

  const fetchAuthor = useCallback(async () => {
    if (!slug) {
      setState({ author: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await axiosGuest.get<{ success: boolean; data: AuthorPublic }>(
        `/authors/${encodeURIComponent(slug)}`
      );
      setState({
        author: res.data?.data ?? null,
        loading: false,
        error: null,
      });
    } catch {
      setState({
        author: null,
        loading: false,
        error: "Author not found",
      });
    }
  }, [slug]);

  useEffect(() => {
    fetchAuthor();
  }, [fetchAuthor]);

  return { ...state, refetch: fetchAuthor };
}
