import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LANDING_PATH_BY_ROLE } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);

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
          <CardDescription>Sign in with your demo credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="h-11"
              />
            </div>
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            <Button type="submit" className="w-full h-11" disabled={pending}>
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Demo: admin / manager / salesman / tech / customer — password: password
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
