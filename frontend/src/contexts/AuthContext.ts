/**
 * Re-export from AuthContext.tsx so imports resolving to .ts work (e.g. Vite cache).
 * The actual implementation lives in AuthContext.tsx.
 */
export {
  AuthProvider,
  useAuth,
  type AuthUser,
  type AuthState,
} from "./AuthContext.tsx";
export { default } from "./AuthContext.tsx";
