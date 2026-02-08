import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  const { user } = useAuth();
  const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : "??";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/70 px-6 backdrop-blur-xl">
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-lg font-semibold tracking-tight leading-none">{title}</h1>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Global search..."
            className="w-64 rounded-xl bg-muted/50 pl-9 focus-visible:bg-background transition-all duration-200"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted/60 transition-colors duration-200">
          <Bell className="size-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        
        <div className="h-8 w-px bg-border mx-1" />
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.username ?? "User"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.role ?? "-"}</p>
          </div>
          <Avatar className="size-9 border-2 border-background shadow-sm cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
