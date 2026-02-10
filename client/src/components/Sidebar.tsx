import type { ComponentType } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Settings,
  LogOut,
  UserPlus,
  ClipboardList,
  BarChart3,
  UsersRound,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/permissions";

const MENU_BY_ROLE: Record<
  Role,
  Array<{ label: string; href: string; icon: ComponentType<{ className?: string }> }>
> = {
  Admin: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/customers", icon: Users },
    { label: "Reports", href: "/orders", icon: BarChart3 },
    { label: "Settings", href: "/appointments", icon: Settings },
  ],
  Sales: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Leads", href: "/leads", icon: UserPlus },
    { label: "Customers", href: "/customers", icon: Users },
  ],
  Technician: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Assigned Jobs", href: "/repairs", icon: Wrench },
    { label: "Updates", href: "/appointments", icon: ClipboardList },
  ],
  Manager: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Team Overview", href: "/customers", icon: UsersRound },
    { label: "Analytics", href: "/orders", icon: Activity },
  ],
  Customer: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Leads", href: "/leads", icon: UserPlus },
    { label: "Appointments", href: "/appointments", icon: ClipboardList },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  Admin: "Owner",
  Sales: "Sales",
  Technician: "Technician",
  Manager: "Manager",
  Customer: "Customer",
};

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role ?? "Customer";
  const visibleItems = MENU_BY_ROLE[role] || MENU_BY_ROLE.Customer;

  return (
    <div className="flex h-screen flex-col border-r w-64 fixed left-0 top-0 z-30 bg-card/80 dark:bg-card/60 backdrop-blur-xl transition-all duration-300 ease-out">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Wrench className="size-4" />
          </div>
          <span>Tech CRM</span>
        </div>
      </div>
      {user && (
        <div className="px-4 py-2 text-xs text-muted-foreground border-b">
          {user.username} · {ROLE_LABEL[role]}
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="grid items-start gap-1">
          {visibleItems.map((item) => {
            const isActive =
              location === item.href || (item.href === "/dashboard" && location === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-all duration-200 hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
