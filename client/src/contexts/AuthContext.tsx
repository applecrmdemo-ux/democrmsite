import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Role } from "@/lib/permissions";

const STORAGE_KEY = "crm_role";
const USER_KEY = "crm_user";

export type AuthUser = {
  username: string;
  role: Role;
  customerId?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loginAsRole: (role: Role) => AuthUser;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function roleToUsername(role: Role): string {
  switch (role) {
    case "Admin":
      return "admin";
    case "Manager":
      return "manager";
    case "Sales":
      return "salesman";
    case "Technician":
      return "tech";
    case "Customer":
      return "customer";
  }
}

function persistUser(authUser: AuthUser, setUser: (value: AuthUser | null) => void) {
  localStorage.setItem(STORAGE_KEY, authUser.role);
  localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  setUser(authUser);
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

  const loginAsRole = (role: Role): AuthUser => {
    const authUser: AuthUser = {
      role,
      username: roleToUsername(role),
      customerId: role === "Customer" ? "demo-customer" : undefined,
    };
    persistUser(authUser, setUser);
    return authUser;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    window.location.href = "/login";
  };

  return <AuthContext.Provider value={{ user, loginAsRole, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
