import axios from "axios";
import { getToken } from "./storage";

// Use .env EXPO_PUBLIC_API_URL (e.g. https://your-api.com/api)
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://api.react-laravel-blogapp.canprojects2.com.tr/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - handled by auth context
    }
    return Promise.reject(error);
  }
);

export const apiGuest = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = API_BASE_URL.replace("/api", "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
