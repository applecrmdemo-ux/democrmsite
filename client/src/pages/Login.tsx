import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LANDING_PATH_BY_ROLE, type Role } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

const ROLE_OPTIONS: Array<{ role: Role; label: string }> = [
  { role: "Admin", label: "Admin" },
  { role: "Manager", label: "Manager" },
  { role: "Sales", label: "Salesman" },
  { role: "Technician", label: "Technician" },
  { role: "Customer", label: "Customer" },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<Role>("Admin");
  const [pending, setPending] = useState(false);
  const { loginAsRole } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
 <<<<<<< codex/make-frontend-deployable-on-vercel-j99taj
    const authUser = loginAsRole(selectedRole);
    setPending(false);
    setLocation(LANDING_PATH_BY_ROLE[authUser.role]);
=======

    const result = await login(username.trim(), password);

    setPending(false);
    if (result.user) {
      setLocation(LANDING_PATH_BY_ROLE[result.user.role]);
      return;
    }

    if (result.error === "invalid_credentials") {
      setError("Invalid username or password.");
      return;
    }

    if (result.error === "network_error") {
      setError(
        "Cannot reach backend API. Set VITE_API_URL (or REACT_APP_API_URL) in Vercel to your Render backend URL.",
      );
      return;
    }

    setError("Login failed due to a server error. Please try again.");
 >>>>>>> main
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800 p-4">
      <Card className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-black/[0.04] dark:border-white/5 shadow-2xl shadow-black/5 dark:shadow-black/30 animate-page-enter">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-md">
              <Wrench className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">Tech CRM</CardTitle>
          <CardDescription>Choose a role and continue directly</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Select role</Label>
              <div className="space-y-2 rounded-lg border border-border p-3">
                {ROLE_OPTIONS.map((option) => (
                  <label key={option.role} className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={option.role}
                      checked={selectedRole === option.role}
                      onChange={() => setSelectedRole(option.role)}
                      className="h-4 w-4"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
 <<<<<<< codex/make-frontend-deployable-on-vercel-j99taj

=======
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
 >>>>>>> main
            <Button type="submit" className="w-full h-11" disabled={pending}>
              {pending ? "Signing in..." : `Continue as ${selectedRole}`}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            No password required. Role-based demo access is enabled.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
