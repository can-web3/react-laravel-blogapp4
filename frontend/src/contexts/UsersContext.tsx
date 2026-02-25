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

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  image: string;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: string[];
}

interface UsersListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface UsersState {
  users: UserListItem[];
  meta: UsersListMeta | null;
  loading: boolean;
  error: string | null;
}

interface UsersContextValue extends UsersState {
  refetch: (page?: number, search?: string) => Promise<void>;
}

const UsersContext = createContext<UsersContextValue | null>(null);

const API_USERS = "/users";

export function UsersProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, setState] = useState<UsersState>({
    users: [],
    meta: null,
    loading: false,
    error: null,
  });

  const fetchUsers = useCallback(
    async (page = 1, search?: string) => {
      if (!token) return;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (search?.trim()) params.set("search", search.trim());
        const res = await axiosGuest.get<{
          success: boolean;
          data: UserListItem[];
          meta: UsersListMeta;
        }>(`${API_USERS}?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setState({
          users: res.data?.data ?? [],
          meta: res.data?.meta ?? null,
          loading: false,
          error: null,
        });
      } catch {
        setState((s) => ({
          ...s,
          loading: false,
          error: "Failed to load users",
        }));
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) fetchUsers();
    else setState({ users: [], meta: null, loading: false, error: null });
  }, [token, fetchUsers]);

  const value = useMemo<UsersContextValue>(
    () => ({ ...state, refetch: fetchUsers }),
    [state, fetchUsers]
  );

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (ctx == null) throw new Error("useUsers must be used within a UsersProvider");
  return ctx;
}

export default UsersContext;
