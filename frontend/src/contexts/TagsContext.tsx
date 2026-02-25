import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { axiosGuest } from "../lib/axiosGuest";
import { useAuth } from "./AuthContext";

export interface TagItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface TagsState {
  tags: TagItem[];
  loading: boolean;
  error: string | null;
}

interface TagsContextValue extends TagsState {
  refetch: () => Promise<void>;
  addTag: (params: { name: string; description?: string }) => Promise<void>;
  updateTag: (id: number, params: { name: string; description?: string }) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
}

const TagsContext = createContext<TagsContextValue | null>(null);

const API_TAGS = "/tags";

export function TagsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<TagsState>({
    tags: [],
    loading: false,
    error: null,
  });

  const fetchTags = useCallback(async () => {
    if (!token) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await axiosGuest.get<{ success: boolean; data: TagItem[] }>(
        API_TAGS,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setState({
        tags: res.data?.data ?? [],
        loading: false,
        error: null,
      });
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Failed to load tags",
      }));
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchTags();
    else setState({ tags: [], loading: false, error: null });
  }, [token, fetchTags]);

  const addTag = useCallback(
    async (params: { name: string; description?: string }) => {
      if (!token) return;
      await axiosGuest.post(
        API_TAGS,
        { name: params.name, description: params.description ?? undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTags();
    },
    [token, fetchTags]
  );

  const updateTag = useCallback(
    async (id: number, params: { name: string; description?: string }) => {
      if (!token) return;
      await axiosGuest.put(
        `${API_TAGS}/${id}`,
        { name: params.name, description: params.description ?? undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTags();
    },
    [token, fetchTags]
  );

  const deleteTag = useCallback(
    async (id: number) => {
      if (!token) return;
      await axiosGuest.delete(`${API_TAGS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTags();
    },
    [token, fetchTags]
  );

  const value = useMemo<TagsContextValue>(
    () => ({
      ...state,
      refetch: fetchTags,
      addTag,
      updateTag,
      deleteTag,
    }),
    [state, fetchTags, addTag, updateTag, deleteTag]
  );

  return (
    <TagsContext.Provider value={value}>
      {children}
    </TagsContext.Provider>
  );
}

export function useTags(): TagsContextValue {
  const ctx = useContext(TagsContext);
  if (ctx == null) {
    throw new Error("useTags must be used within a TagsProvider");
  }
  return ctx;
}

export default TagsContext;
