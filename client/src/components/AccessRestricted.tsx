import { ShieldX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/** Shown when user lacks permission to view the current page */
export function AccessRestricted() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-page-enter">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">Access Restricted</h1>
          <p className="text-sm text-muted-foreground">
            Your role ({user?.role ?? "unknown"}) does not have permission to view this page.
            Please contact an administrator if you believe this is an error.
          </p>
        </div>
      </div>
    </div>
  );
}
