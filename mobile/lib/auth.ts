import { api, apiGuest } from "./api";
import { setToken, setUser, clearAll } from "./storage";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "./types";

// Login with credentials against Laravel /auth/login
export async function login(
  credentials: LoginCredentials
): Promise<{ user: User; token: string }> {
  const response = await api.post<AuthResponse>("/auth/login", credentials);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Login failed");
  }

  const data = response.data as { user?: User; token?: string; data?: { user: User; token: string } };
  const user = data.data?.user ?? data.user!;
  const token = data.data?.token ?? data.token!;

  await setToken(token);
  await setUser<User>(user);

  return { user, token };
}

export async function register(
  credentials: RegisterCredentials
): Promise<{ user: User; token: string }> {
  const response = await api.post<AuthResponse>("/auth/register", credentials);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Register failed");
  }

  const data = response.data as { user?: User; token?: string; data?: { user: User; token: string } };
  const user = data.data?.user ?? data.user!;
  const token = data.data?.token ?? data.token!;

  await setToken(token);
  await setUser<User>(user);

  return { user, token };
}

export async function logout(): Promise<void> {
  await clearAll();
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await apiGuest.post<{ success: boolean; message?: string }>(
    "/auth/forgot-password",
    { email }
  );
  if (!response.data?.success) {
    throw new Error(response.data?.message ?? "Failed to send reset link.");
  }
}
