import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiUrl } from "@/lib/api";
import type { Role } from "@/lib/permissions";

const STORAGE_KEY = "crm_role";
const USER_KEY = "crm_user";

const DEMO_ROLE_BY_USERNAME: Record<string, Role> = {
  admin: "Admin",
  manager: "Manager",
  salesman: "Sales",
  tech: "Technician",
  customer: "Customer",
};

export type AuthUser = {
  username: string;
  role: Role;
  customerId?: string;
};

export type LoginResult = {
  user: AuthUser | null;
  error?: "invalid_credentials" | "network_error" | "server_error";
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function persistUser(authUser: AuthUser, setUser: (value: AuthUser | null) => void) {
  localStorage.setItem(STORAGE_KEY, authUser.role);
  localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  setUser(authUser);
}

function demoLogin(username: string, password: string): AuthUser | null {
  const role = DEMO_ROLE_BY_USERNAME[username];
  if (!role || password !== "password") return null;
  return { username, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem(STORAGE_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (role && u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        const { user: u } = data;
        if (u?.role) {
          const authUser: AuthUser = {
            username: u.username,
            role: u.role as Role,
            customerId: u.customerId,
          };
          persistUser(authUser, setUser);
          return { user: authUser };
        }
        return { user: null, error: "server_error" };
      }

      const fallback = demoLogin(cleanUsername, cleanPassword);
      if (fallback) {
        persistUser(fallback, setUser);
        return { user: fallback };
      }

      if (res.status === 401) return { user: null, error: "invalid_credentials" };
      return { user: null, error: "server_error" };
    } catch {
      const fallback = demoLogin(cleanUsername, cleanPassword);
      if (fallback) {
        persistUser(fallback, setUser);
        return { user: fallback };
      }
      return { user: null, error: "network_error" };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    window.location.href = "/login";
  };

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
