import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Wrench, 
  ShoppingCart, 
  CalendarDays,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Products", href: "/products", icon: Package },
  { label: "Repairs", href: "/repairs", icon: Wrench },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen flex-col border-r bg-card w-64 fixed left-0 top-0 z-30 shadow-sm transition-all duration-300">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Wrench className="size-4" />
          </div>
          <span>Tech CRM</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="grid items-start gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
          <Settings className="size-4" />
          Settings
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10">
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
