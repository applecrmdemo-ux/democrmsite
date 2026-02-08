import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  ShoppingCart,
  CalendarDays,
  Settings,
  LogOut,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/lib/permissions";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Leads", href: "/leads", icon: UserPlus },
  { label: "Products", href: "/products", icon: Package },
  { label: "Repairs", href: "/repairs", icon: Wrench },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const role = user?.role ?? "Customer";
  const visibleItems = NAV_ITEMS.filter((item) => canAccessRoute(role, item.href));

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
          {user.username} · {user.role}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="grid items-start gap-1">
          {visibleItems.map((item) => {
            const isActive = location === item.href || (item.href === "/" && location === "/dashboard");
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
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground">
          <Settings className="size-4" />
          Settings
        </button>
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
