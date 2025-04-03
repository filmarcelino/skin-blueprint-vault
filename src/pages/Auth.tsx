
import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { Card, CardContent } from "@/components/ui/card";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="blueprint-lines w-full max-w-md">
        <Card className="blueprint-card border-primary/40 shadow-lg">
          <CardContent className="pt-6">
            {isLogin ? (
              <LoginForm onToggle={toggleForm} />
            ) : (
              <RegisterForm onToggle={toggleForm} />
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,195,255,0.03),transparent_50%)]"></div>
      </div>
    </div>
  );
};

export default Auth;
