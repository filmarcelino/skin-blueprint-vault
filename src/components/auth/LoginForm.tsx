
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";

interface LoginFormProps {
  onToggle: () => void;
}

const LoginForm = ({ onToggle }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithSteam, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    
    const user = await login(email, password);
    if (user) {
      toast.success("Login successful");
    }
  };

  const handleSteamLogin = async () => {
    await loginWithSteam();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight glow-text">
          Login to SKIN<span className="text-primary">CULATOR</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your credentials to access your account
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="blueprint-input"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="blueprint-input"
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleSteamLogin}
      >
        <Gamepad2 className="mr-2 h-4 w-4" />
        Continue with Steam
      </Button>
      
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Button variant="link" className="p-0" onClick={onToggle}>
          Register
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
