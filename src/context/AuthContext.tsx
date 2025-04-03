
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { getCurrentUser, initAuth, login, loginWithSteam, logout, register } from "@/services/auth";
import { toast } from "sonner";
import { supabase } from "@/services/supabase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string) => Promise<User | null>;
  loginWithSteam: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      await initAuth();
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    
    loadUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const updatedUser = await getCurrentUser();
          setUser(updatedUser);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await login(email, password);
      setUser(user);
      return user;
    } catch (error) {
      toast.error("Login failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await register(email, password);
      setUser(user);
      return user;
    } catch (error) {
      toast.error("Registration failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithSteam = async () => {
    try {
      await loginWithSteam();
    } catch (error) {
      toast.error("Steam login failed");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        loginWithSteam: handleLoginWithSteam,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
