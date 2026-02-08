/**
 * API base URL for backend. Use when frontend runs on different port (e.g. Vite 5173).
 */
export const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
