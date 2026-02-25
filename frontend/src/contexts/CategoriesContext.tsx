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

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CategoriesState {
  categories: CategoryItem[];
  loading: boolean;
  error: string | null;
}

interface CategoriesContextValue extends CategoriesState {
  refetch: () => Promise<void>;
  addCategory: (params: { name: string; description?: string }) => Promise<void>;
  updateCategory: (id: number, params: { name: string; description?: string }) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

const API_CATEGORIES = "/categories";

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<CategoriesState>({
    categories: [],
    loading: false,
    error: null,
  });

  const fetchCategories = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const res = await axiosGuest.get<{ success: boolean; data: CategoryItem[] }>(
        API_CATEGORIES,
        headers ? { headers } : {}
      );
      setState({
        categories: res.data?.data ?? [],
        loading: false,
        error: null,
      });
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Failed to load categories",
      }));
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(
    async (params: { name: string; description?: string }) => {
      if (!token) return;
      await axiosGuest.post(
        API_CATEGORIES,
        { name: params.name, description: params.description ?? undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCategories();
    },
    [token, fetchCategories]
  );

  const updateCategory = useCallback(
    async (id: number, params: { name: string; description?: string }) => {
      if (!token) return;
      await axiosGuest.put(
        `${API_CATEGORIES}/${id}`,
        { name: params.name, description: params.description ?? undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCategories();
    },
    [token, fetchCategories]
  );

  const deleteCategory = useCallback(
    async (id: number) => {
      if (!token) return;
      await axiosGuest.delete(`${API_CATEGORIES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCategories();
    },
    [token, fetchCategories]
  );

  const value = useMemo<CategoriesContextValue>(
    () => ({
      ...state,
      refetch: fetchCategories,
      addCategory,
      updateCategory,
      deleteCategory,
    }),
    [state, fetchCategories, addCategory, updateCategory, deleteCategory]
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextValue {
  const ctx = useContext(CategoriesContext);
  if (ctx == null) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return ctx;
}

export default CategoriesContext;
