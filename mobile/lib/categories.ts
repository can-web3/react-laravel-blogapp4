import { apiGuest } from "./api";

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export async function fetchCategories(): Promise<{
  success: boolean;
  data: CategoryItem[];
}> {
  const response = await apiGuest.get<{ success: boolean; data: CategoryItem[] }>(
    "/categories"
  );
  return response.data;
}

export async function fetchCategoryBySlug(slug: string): Promise<{
  success: boolean;
  data: CategoryItem;
}> {
  const response = await apiGuest.get<{
    success: boolean;
    data: CategoryItem;
  }>(`/categories/${encodeURIComponent(slug)}`);
  return response.data;
}
