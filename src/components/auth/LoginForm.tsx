
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LoginFormProps {
  onToggle: () => void;
}

const LoginForm = ({ onToggle }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSteamLoading, setSteamLoading] = useState(false);
  const { login, loginWithSteam, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    const user = await login(email, password);
    if (user) {
      toast.success("Login realizado com sucesso");
    }
  };

  const handleSteamLogin = async () => {
    try {
      setSteamLoading(true);
      await loginWithSteam();
    } catch (error) {
      console.error("Erro no login com Steam:", error);
      toast.error("Falha ao iniciar login com Steam");
    } finally {
      setSteamLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight glow-text">
          Login to SKIN<span className="text-primary">CULATOR</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Entre com suas credenciais para acessar sua conta
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="blueprint-input"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : "Entrar"}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            ou continue com
          </span>
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        className="w-full relative overflow-hidden"
        onClick={handleSteamLogin}
        disabled={isSteamLoading || isLoading}
      >
        {isSteamLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando com Steam...
          </>
        ) : (
          <>
            <Gamepad2 className="mr-2 h-4 w-4" />
            Continuar com Steam
            <div className="absolute inset-0 bg-gradient-to-r from-[#1b2838]/0 via-[#1b2838]/30 to-[#1b2838]/0 translate-x-[-100%] animate-steamPulse"></div>
          </>
        )}
      </Button>
      
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Não tem uma conta? </span>
        <Button variant="link" className="p-0" onClick={onToggle}>
          Registrar
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
