import { useCallback, useEffect, useState } from "react";
import { axiosGuest } from "@/lib/axiosGuest";
import { useAuth } from "@/contexts/AuthContext";

export interface CommentUser {
  id: number;
  username: string;
}

export interface CommentItem {
  id: number;
  body: string;
  created_at: string | null;
  user: CommentUser | null;
}

interface BlogCommentsState {
  comments: CommentItem[];
  loading: boolean;
  error: string | null;
}

export function useBlogComments(
  slug: string | undefined
): BlogCommentsState & {
  refetch: () => Promise<void>;
  addComment: (body: string) => Promise<{ success: boolean; error?: string }>;
} {
  const { token } = useAuth();
  const [state, setState] = useState<BlogCommentsState>({
    comments: [],
    loading: !!slug,
    error: null,
  });

  const fetchComments = useCallback(async () => {
    if (!slug) {
      setState({ comments: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await axiosGuest.get<{ success: boolean; data: CommentItem[] }>(
        `/blogs/${encodeURIComponent(slug)}/comments`
      );
      setState({
        comments: res.data?.data ?? [],
        loading: false,
        error: null,
      });
    } catch {
      setState({
        comments: [],
        loading: false,
        error: "Failed to load comments",
      });
    }
  }, [slug]);

  const addComment = useCallback(
    async (body: string): Promise<{ success: boolean; error?: string }> => {
      if (!slug || !token?.trim()) {
        return { success: false, error: "Not authenticated" };
      }
      const trimmed = body.trim();
      if (!trimmed) {
        return { success: false, error: "Comment cannot be empty" };
      }
      try {
        await axiosGuest.post(
          `/blogs/${encodeURIComponent(slug)}/comments`,
          { body: trimmed },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchComments();
        return { success: true };
      } catch (err: unknown) {
        const data = err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response?.data
          : undefined;
        const message = data?.message ?? (Array.isArray(data?.errors?.body) ? data.errors.body[0] : undefined) ?? "Failed to add comment";
        return { success: false, error: message };
      }
    },
    [slug, token, fetchComments]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { ...state, refetch: fetchComments, addComment };
}
