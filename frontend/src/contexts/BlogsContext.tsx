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

export interface BlogUser {
  id: number;
  username: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface BlogItem {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  featured_image: string | null;
  status: string;
  published_at: string | null;
  view_count: number;
  like_count?: number;
  user_has_liked?: boolean;
  bookmark_count?: number;
  user_has_bookmarked?: boolean;
  comment_count?: number;
  reading_time_minutes: number | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at?: string;
  updated_at?: string;
  user?: BlogUser;
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

export interface BlogListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface BlogsState {
  blogs: BlogItem[];
  meta: BlogListMeta | null;
  loading: boolean;
  error: string | null;
}

export interface BlogParams {
  title: string;
  excerpt?: string;
  body: string;
  category_id?: number | null;
  tag_ids?: number[];
  featured_image?: string | null;
  featured_image_file?: File | null;
  status: string;
  published_at?: string | null;
}

interface BlogsContextValue extends BlogsState {
  refetch: (page?: number, status?: string, category_id?: number) => Promise<void>;
  addBlog: (params: BlogParams) => Promise<void>;
  updateBlog: (slug: string, params: BlogParams) => Promise<void>;
  deleteBlog: (slug: string) => Promise<void>;
  getBlog: (slug: string) => Promise<BlogItem | null>;
}

const BlogsContext = createContext<BlogsContextValue | null>(null);

const API_BLOGS = "/blogs";

function buildBlogFormData(params: BlogParams): FormData {
  const form = new FormData();
  form.append("title", params.title);
  form.append("body", params.body);
  form.append("status", params.status);
  if (params.excerpt != null) form.append("excerpt", params.excerpt);
  if (params.category_id != null) form.append("category_id", String(params.category_id));
  (params.tag_ids ?? []).forEach((id) => form.append("tag_ids[]", String(id)));
  if (params.published_at != null) form.append("published_at", params.published_at);
  if (params.featured_image_file) {
    form.append("featured_image", params.featured_image_file, params.featured_image_file.name);
  }
  return form;
}

export function BlogsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<BlogsState>({
    blogs: [],
    meta: null,
    loading: false,
    error: null,
  });

  const fetchBlogs = useCallback(
    async (page = 1, status?: string, category_id?: number) => {
      if (!token) return;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (status) params.set("status", status);
        if (category_id != null) params.set("category_id", String(category_id));
        const res = await axiosGuest.get<{
          success: boolean;
          data: BlogItem[];
          meta: BlogListMeta;
        }>(`${API_BLOGS}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setState({
          blogs: res.data?.data ?? [],
          meta: res.data?.meta ?? null,
          loading: false,
          error: null,
        });
      } catch {
        setState((s) => ({
          ...s,
          loading: false,
          error: "Failed to load blogs",
        }));
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) fetchBlogs();
    else setState({ blogs: [], meta: null, loading: false, error: null });
  }, [token, fetchBlogs]);

  const addBlog = useCallback(
    async (params: BlogParams) => {
      if (!token) return;
      const hasFile = params.featured_image_file != null;
      if (hasFile) {
        const formData = buildBlogFormData(params);
        await axiosGuest.post(API_BLOGS, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axiosGuest.post(
          API_BLOGS,
          {
            title: params.title,
            excerpt: params.excerpt ?? undefined,
            body: params.body,
            category_id: params.category_id ?? undefined,
            tag_ids: params.tag_ids ?? [],
            status: params.status,
            published_at: params.published_at ?? undefined,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchBlogs(state.meta?.current_page ?? 1);
    },
    [token, fetchBlogs, state.meta?.current_page]
  );

  const updateBlog = useCallback(
    async (slug: string, params: BlogParams) => {
      if (!token) return;
      const encodedSlug = encodeURIComponent(slug);
      const hasFile = params.featured_image_file != null;
      if (hasFile) {
        const formData = buildBlogFormData(params);
        formData.append("_method", "PUT");
        await axiosGuest.post(`${API_BLOGS}/${encodedSlug}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axiosGuest.put(
          `${API_BLOGS}/${encodedSlug}`,
          {
            title: params.title,
            excerpt: params.excerpt ?? undefined,
            body: params.body,
            category_id: params.category_id ?? undefined,
            tag_ids: params.tag_ids ?? [],
            status: params.status,
            published_at: params.published_at ?? undefined,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchBlogs(state.meta?.current_page ?? 1);
    },
    [token, fetchBlogs, state.meta?.current_page]
  );

  const deleteBlog = useCallback(
    async (slug: string) => {
      if (!token) return;
      await axiosGuest.delete(`${API_BLOGS}/${encodeURIComponent(slug)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchBlogs(state.meta?.current_page ?? 1);
    },
    [token, fetchBlogs, state.meta?.current_page]
  );

  const getBlog = useCallback(
    async (slug: string): Promise<BlogItem | null> => {
      if (!token) return null;
      try {
        const res = await axiosGuest.get<{ success: boolean; data: BlogItem }>(
          `${API_BLOGS}/${encodeURIComponent(slug)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data?.data ?? null;
      } catch {
        return null;
      }
    },
    [token]
  );

  const value = useMemo<BlogsContextValue>(
    () => ({
      ...state,
      refetch: fetchBlogs,
      addBlog,
      updateBlog,
      deleteBlog,
      getBlog,
    }),
    [state, fetchBlogs, addBlog, updateBlog, deleteBlog, getBlog]
  );

  return (
    <BlogsContext.Provider value={value}>
      {children}
    </BlogsContext.Provider>
  );
}

export function useBlogs(): BlogsContextValue {
  const ctx = useContext(BlogsContext);
  if (ctx == null) {
    throw new Error("useBlogs must be used within a BlogsProvider");
  }
  return ctx;
}

export default BlogsContext;
