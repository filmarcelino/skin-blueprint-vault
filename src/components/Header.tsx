
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="blueprint-header sticky top-0 w-full z-10">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="text-primary text-lg font-bold glow-text">S</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight glow-text">
            SKIN<span className="text-primary">CULATOR</span>
          </h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center border border-primary/30">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">{user.displayName}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
