/**
 * API base URL for backend.
 * Supports both Vite and CRA-style env variable names.
 */
const ENV_API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  (import.meta.env.REACT_APP_API_URL as string | undefined)?.trim() ||
  "";

export const API_BASE = ENV_API_BASE || (import.meta.env.DEV ? "http://localhost:5000" : "");

export const hasConfiguredApiBase = Boolean(ENV_API_BASE);

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE) return p;
  return `${API_BASE.replace(/\/$/, "")}${p}`;
}
