import { api, apiGuest } from "./api";
import { getToken } from "./storage";
import type {
  BlogListResponse,
  BlogDetailResponse,
  PopularAuthor,
  PopularTag,
  Comment,
} from "./types";

export type SortType = "latest" | "trending" | "discussed";

interface FetchBlogsParams {
  perPage?: number;
  sort?: SortType;
  page?: number;
  search?: string;
  tagSlug?: string;
  categorySlug?: string;
  authorSlug?: string;
  bookmarked?: boolean;
  liked?: boolean;
}

export async function fetchBlogs(params: FetchBlogsParams = {}): Promise<BlogListResponse> {
  const {
    perPage = 10,
    sort = "latest",
    page = 1,
    search,
    tagSlug,
    categorySlug,
    authorSlug,
    bookmarked,
    liked,
  } = params;

  const queryParams = new URLSearchParams({
    per_page: String(perPage),
    sort,
    page: String(page),
  });

  if (search) queryParams.append("search", search);
  if (tagSlug) queryParams.append("tag_slug", tagSlug);
  if (categorySlug) queryParams.append("category_slug", categorySlug);
  if (authorSlug) queryParams.append("author_slug", authorSlug);
  if (bookmarked) queryParams.append("bookmarked", "1");
  if (liked) queryParams.append("liked", "1");

  const client = bookmarked || liked ? api : apiGuest;
  const response = await client.get<BlogListResponse>(`/blogs?${queryParams}`);
  return response.data;
}

export async function fetchTrendingBlogs(limit = 8): Promise<BlogListResponse> {
  return fetchBlogs({ perPage: limit, sort: "trending" });
}

export async function fetchLatestBlogs(limit = 8): Promise<BlogListResponse> {
  return fetchBlogs({ perPage: limit, sort: "latest" });
}

export async function fetchDiscussedBlogs(limit = 8): Promise<BlogListResponse> {
  return fetchBlogs({ perPage: limit, sort: "discussed" });
}

export async function fetchPopularAuthors(limit = 6): Promise<{ success: boolean; data: PopularAuthor[] }> {
  const response = await apiGuest.get(`/authors?limit=${limit}`);
  return response.data;
}

export async function fetchPopularTags(limit = 9): Promise<{ success: boolean; data: PopularTag[] }> {
  const response = await apiGuest.get(`/tags/popular?limit=${limit}`);
  return response.data;
}

export async function fetchTagBySlug(slug: string): Promise<{ success: boolean; data: { id: number; name: string; slug: string } }> {
  const response = await apiGuest.get(`/tags/${slug}`);
  return response.data;
}

export async function fetchBlogBySlug(slug: string): Promise<BlogDetailResponse> {
  const token = await getToken();
  const client = token ? api : apiGuest;
  const response = await client.get<BlogDetailResponse>(`/blogs/${slug}`);
  return response.data;
}

export async function fetchBlogComments(blogSlugOrId: string | number): Promise<{ success: boolean; data: Comment[] }> {
  const response = await apiGuest.get(`/blogs/${encodeURIComponent(String(blogSlugOrId))}/comments`);
  return response.data;
}

export async function likeBlog(blogId: number): Promise<void> {
  await api.post(`/blogs/${blogId}/like`);
}

export async function unlikeBlog(blogId: number): Promise<void> {
  await api.delete(`/blogs/${blogId}/like`);
}

export async function bookmarkBlog(blogId: number): Promise<void> {
  await api.post(`/blogs/${blogId}/bookmark`);
}

export async function unbookmarkBlog(blogId: number): Promise<void> {
  await api.delete(`/blogs/${blogId}/bookmark`);
}

export async function addComment(
  blogSlugOrId: string | number,
  body: string,
  parentId?: number
): Promise<{ success: boolean; data: Comment }> {
  const response = await api.post(
    `/blogs/${encodeURIComponent(String(blogSlugOrId))}/comments`,
    { body, parent_id: parentId }
  );
  return response.data;
}
