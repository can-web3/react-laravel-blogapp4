import { api } from "./api";
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

  const { user, token } = response.data.data;

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

  const { user, token } = response.data.data;

  await setToken(token);
  await setUser<User>(user);

  return { user, token };
}

export async function logout(): Promise<void> {
  await clearAll();
}
