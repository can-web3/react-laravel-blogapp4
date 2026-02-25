import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { axiosGuest } from "../lib/axiosGuest";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export interface AuthUser {
  id: number;
  name?: string;
  username: string;
  slug?: string;
  email: string;
  email_verified_at?: string | null;
  avatar?: string | null;
  /** Profile image full URL; from backend (UserResource / User model attribute). */
  image?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: string[];
  permissions?: string[];
}

const DEFAULT_PROFILE_PATH = "/images/profile.png";

/** Backend root URL for static assets (no /api). Used only when image is null (e.g. cached user from before backend sent image). */
function getDefaultImageUrl(): string {
  const apiUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  const root = apiUrl.replace(/\/api\/?$/, "");
  return root ? `${root}${DEFAULT_PROFILE_PATH}` : DEFAULT_PROFILE_PATH;
}

/** Use backend image when present (full URL); fallback to default when null (e.g. F5 with old cached user). */
function normalizeUser(user: AuthUser): AuthUser {
  const raw = user?.image ?? user?.avatar ?? null;
  const image =
    raw && raw.startsWith("http") ? raw : getDefaultImageUrl();
  return { ...user, image };
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: AuthUser;
  token: string;
  roles?: string[];
  permissions?: string[];
}

interface MeResponse {
  user: AuthUser;
  roles: string[];
  permissions: string[];
}

interface AuthApiError {
  response?: {
    data?: { message?: string; errors?: Record<string, string[]> };
    status?: number;
  };
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

type AuthAction =
  | { type: "INIT"; payload: { token: string | null; user: AuthUser | null } }
  | { type: "LOGIN_SUCCESS"; payload: { token: string; user: AuthUser } }
  | { type: "REFRESH_USER"; payload: AuthUser }
  | { type: "LOGOUT" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: !!action.payload.token,
        isInitialized: true,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isInitialized: true,
      };
    case "REFRESH_USER":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialized: true,
      };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
};

interface AuthContextValue extends AuthState {
  login: (
    credentials: LoginCredentials
  ) => Promise<
    | { success: true }
    | { success: false; errors?: Record<string, string[]>; message?: string }
  >;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStoredAuth(): Pick<AuthState, "user" | "token"> {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userJson = localStorage.getItem(AUTH_USER_KEY);
    const user = userJson ? (JSON.parse(userJson) as AuthUser) : null;
    if (token && user) return { token, user: normalizeUser(user) };
    if (token) return { token, user: null };
  } catch {
    // ignore invalid stored data
  }
  return { token: null, user: null };
}

function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function setStoredAuth(token: string, user: AuthUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const { token, user } = loadStoredAuth();
    dispatch({ type: "INIT", payload: { token, user } });
  }, []);

  useEffect(() => {
    if (!state.isInitialized || !state.token) return;
    axiosGuest
      .get<MeResponse>("/user", {
        headers: { Authorization: `Bearer ${state.token}` },
      })
      .then((res) => {
        const u = res.data.user;
        const fresh: AuthUser = {
          ...normalizeUser(u),
          roles: res.data.roles ?? [],
          permissions: res.data.permissions ?? [],
        };
        setStoredAuth(state.token!, fresh);
        dispatch({ type: "REFRESH_USER", payload: fresh });
      })
      .catch(() => {
        clearStoredAuth();
        dispatch({ type: "LOGOUT" });
      });
  }, [state.isInitialized, state.token]);

  const login = useCallback(
    async (
      credentials: LoginCredentials
    ): Promise<
      | { success: true }
      | { success: false; errors?: Record<string, string[]>; message?: string }
    > => {
      try {
        const res = await axiosGuest.post<LoginResponse>(
          "/auth/login",
          credentials
        );
        const data = res.data;
        if (res.status === 200 && data.token && data.user) {
          const user: AuthUser = {
            ...normalizeUser(data.user as AuthUser),
            roles: data.roles ?? [],
            permissions: data.permissions ?? [],
          };
          setStoredAuth(data.token, user);
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { token: data.token, user },
          });
          return { success: true };
        }
        return { success: false, message: "Sign in failed" };
      } catch (err: unknown) {
        const e = err as AuthApiError;
        const data = e.response?.data;
        const errors = data?.errors;
        const message = data?.message;
        return {
          success: false,
          errors: errors ?? undefined,
          message: message ?? "Request failed",
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    dispatch({ type: "LOGOUT" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export default AuthContext;
