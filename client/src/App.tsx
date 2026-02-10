import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/lib/permissions";
import { AccessRestricted } from "@/components/AccessRestricted";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import Products from "@/pages/Products";
import Repairs from "@/pages/Repairs";
import Orders from "@/pages/Orders";
import Appointments from "@/pages/Appointments";
import Leads from "@/pages/Leads";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-muted animate-skeleton-shimmer" />
          <div className="h-3 w-24 rounded-lg bg-muted animate-skeleton-shimmer" />
        </div>
      </div>
    );
  }
  if (!user && location !== "/login") {
    return <Redirect to="/login" />;
  }
  return <>{children}</>;
}

function RoleRoute({ path, children }: { path: string; children: React.ReactNode }) {
  const { user } = useAuth();
  const role = user?.role ?? "Customer";

  if (!canAccessRoute(role, path)) {
    return <AccessRestricted />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <RoleRoute path="/dashboard">
            <Dashboard />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <RoleRoute path="/">
            <Dashboard />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/customers">
        <ProtectedRoute>
          <RoleRoute path="/customers">
            <Customers />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/products">
        <ProtectedRoute>
          <RoleRoute path="/products">
            <Products />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/repairs">
        <ProtectedRoute>
          <RoleRoute path="/repairs">
            <Repairs />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/orders">
        <ProtectedRoute>
          <RoleRoute path="/orders">
            <Orders />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/appointments">
        <ProtectedRoute>
          <RoleRoute path="/appointments">
            <Appointments />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/leads">
        <ProtectedRoute>
          <RoleRoute path="/leads">
            <Leads />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
