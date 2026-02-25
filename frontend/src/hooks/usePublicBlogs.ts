import { useCallback, useEffect, useState } from "react";
import { axiosGuest } from "@/lib/axiosGuest";
import { featuredImageSrc } from "@/lib/featuredImage";
import type { BlogItem } from "@/contexts/BlogsContext";

export type SortKind = "latest" | "trending" | "discussed";

/** Tag for card: display name, link by slug */
export interface BlogCardTag {
  name: string;
  slug: string;
}

/** BlogCard'ın beklediği şekil (id, title, excerpt, slug, image, category, categorySlug, tags, author, authorAvatar, likes, comments, bookmarks, publishedAt). */
export interface BlogCardBlog {
  id: number | string;
  title: string;
  excerpt: string;
  slug: string;
  image: string;
  category: string;
  categorySlug?: string;
  tags: BlogCardTag[];
  author: string;
  authorAvatar: string;
  likes: number;
  comments: number;
  bookmarks: number;
  publishedAt?: string;
}

const defaultAvatar = "https://i.pravatar.cc/150?u=user";

function formatPublishedAt(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

export function blogItemToCardBlog(item: BlogItem): BlogCardBlog {
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt ?? "",
    slug: item.slug,
    image: featuredImageSrc(item.featured_image) || "https://picsum.photos/seed/blog/600/400",
    category: item.category?.name ?? "",
    categorySlug: item.category?.slug,
    tags: (item.tags ?? []).map((t) => ({ name: t.name, slug: t.slug })),
    author: item.user?.username ?? "Author",
    authorAvatar: defaultAvatar,
    likes: item.like_count ?? 0,
    comments: item.comment_count ?? 0,
    bookmarks: item.bookmark_count ?? 0,
    publishedAt: formatPublishedAt(item.published_at ?? item.created_at),
  };
}

interface PublicBlogsState {
  blogs: BlogCardBlog[];
  loading: boolean;
  error: string | null;
}

export function usePublicBlogs(limit: number, sort: SortKind): PublicBlogsState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<PublicBlogsState>({
    blogs: [],
    loading: true,
    error: null,
  });

  const fetchBlogs = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({
        per_page: String(limit),
        sort,
      });
      const res = await axiosGuest.get<{ success: boolean; data: BlogItem[] }>(
        `/blogs?${params}`
      );
      const items = res.data?.data ?? [];
      setState({
        blogs: items.map(blogItemToCardBlog),
        loading: false,
        error: null,
      });
    } catch {
      setState({
        blogs: [],
        loading: false,
        error: "Failed to load blogs",
      });
    }
  }, [limit, sort]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { ...state, refetch: fetchBlogs };
}

const BLOGS_LIST_PAGE_SIZE = 12;

export function usePublicBlogsList(
  page: number,
  sort: SortKind,
  search?: string
): PublicBlogsByTagState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<PublicBlogsByTagState>({
    blogs: [],
    meta: null,
    loading: true,
    error: null,
  });

  const fetchBlogs = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(BLOGS_LIST_PAGE_SIZE),
        sort,
      });
      if (search && search.trim()) {
        params.set("search", search.trim());
      }
      const res = await axiosGuest.get<{
        success: boolean;
        data: BlogItem[];
        meta: BlogListMeta;
      }>(`/blogs?${params}`);
      const items = res.data?.data ?? [];
      const meta = res.data?.meta ?? null;
      setState({
        blogs: items.map(blogItemToCardBlog),
        meta,
        loading: false,
        error: null,
      });
    } catch {
      setState({
        blogs: [],
        meta: null,
        loading: false,
        error: "Failed to load blogs",
      });
    }
  }, [page, sort, search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { ...state, refetch: fetchBlogs };
}

export interface TagPublic {
  id: number;
  name: string;
  slug: string;
}

interface PublicTagState {
  tag: TagPublic | null;
  loading: boolean;
  error: string | null;
}

export function useTagBySlug(slug: string | undefined): PublicTagState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<PublicTagState>({
    tag: null,
    loading: !!slug,
    error: null,
  });

  const fetchTag = useCallback(async () => {
    if (!slug) {
      setState({ tag: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await axiosGuest.get<{ success: boolean; data: TagPublic }>(`/tags/${encodeURIComponent(slug)}`);
      setState({
        tag: res.data?.data ?? null,
        loading: false,
        error: null,
      });
    } catch {
      setState({
        tag: null,
        loading: false,
        error: "Tag not found",
      });
    }
  }, [slug]);

  useEffect(() => {
    fetchTag();
  }, [fetchTag]);

  return { ...state, refetch: fetchTag };
}

interface BlogListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface PublicBlogsByTagState {
  blogs: BlogCardBlog[];
  meta: BlogListMeta | null;
  loading: boolean;
  error: string | null;
}

export function usePublicBlogsByTag(
  tagSlug: string | undefined,
  page: number,
  search?: string
): PublicBlogsByTagState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<PublicBlogsByTagState>({
    blogs: [],
    meta: null,
    loading: true,
    error: null,
  });

  const fetchBlogs = useCallback(async () => {
    if (!tagSlug) {
      setState({ blogs: [], meta: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({
        tag_slug: tagSlug,
        page: String(page),
        per_page: "12",
        sort: "latest",
      });
      if (search && search.trim()) {
        params.set("search", search.trim());
      }
      const res = await axiosGuest.get<{
        success: boolean;
        data: BlogItem[];
        meta: BlogListMeta;
      }>(`/blogs?${params}`);
      const items = res.data?.data ?? [];
      const meta = res.data?.meta ?? null;
      setState({
        blogs: items.map(blogItemToCardBlog),
        meta,
        loading: false,
        error: null,
      });
    } catch {
      setState({
        blogs: [],
        meta: null,
        loading: false,
        error: "Failed to load blogs",
      });
    }
  }, [tagSlug, page, search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { ...state, refetch: fetchBlogs };
}

export function usePublicBlogsByCategory(
  categorySlug: string | undefined,
  page: number,
  search?: string
): PublicBlogsByTagState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<PublicBlogsByTagState>({
    blogs: [],
    meta: null,
    loading: true,
    error: null,
  });

  const fetchBlogs = useCallback(async () => {
    if (!categorySlug) {
      setState({ blogs: [], meta: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({
        category_slug: categorySlug,
        page: String(page),
        per_page: "12",
        sort: "latest",
      });
      if (search && search.trim()) {
        params.set("search", search.trim());
      }
      const res = await axiosGuest.get<{
        success: boolean;
        data: BlogItem[];
        meta: BlogListMeta;
      }>(`/blogs?${params}`);
      const items = res.data?.data ?? [];
      const meta = res.data?.meta ?? null;
      setState({
        blogs: items.map(blogItemToCardBlog),
        meta,
        loading: false,
        error: null,
      });
    } catch {
      setState({
        blogs: [],
        meta: null,
        loading: false,
        error: "Failed to load blogs",
      });
    }
  }, [categorySlug, page, search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { ...state, refetch: fetchBlogs };
}

export function usePublicBlogsByAuthor(
  authorSlug: string | undefined,
  page: number
): PublicBlogsByTagState & { refetch: () => Promise<void> } {
  const [state, setState] = useState<PublicBlogsByTagState>({
    blogs: [],
    meta: null,
    loading: true,
    error: null,
  });

  const fetchBlogs = useCallback(async () => {
    if (!authorSlug) {
      setState({ blogs: [], meta: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams({
        author_slug: authorSlug,
        page: String(page),
        per_page: "12",
        sort: "latest",
      });
      const res = await axiosGuest.get<{
        success: boolean;
        data: BlogItem[];
        meta: BlogListMeta;
      }>(`/blogs?${params}`);
      const items = res.data?.data ?? [];
      const meta = res.data?.meta ?? null;
      setState({
        blogs: items.map(blogItemToCardBlog),
        meta,
        loading: false,
        error: null,
      });
    } catch {
      setState({
        blogs: [],
        meta: null,
        loading: false,
        error: "Failed to load blogs",
      });
    }
  }, [authorSlug, page]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { ...state, refetch: fetchBlogs };
}
