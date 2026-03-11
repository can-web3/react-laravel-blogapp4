export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  slug?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Blog Types
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
  created_at?: string;
  updated_at?: string;
  user?: BlogUser;
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

export interface Comment {
  id: number;
  user_id: number;
  blog_id: number;
  parent_id: number | null;
  body: string;
  created_at: string;
  updated_at: string;
  user?: BlogUser;
  replies?: Comment[];
}

export interface BlogDetailResponse {
  success: boolean;
  data: BlogItem;
}

export interface BlogListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface BlogListResponse {
  success: boolean;
  data: BlogItem[];
  meta?: BlogListMeta;
}

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

export interface PopularTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}
