
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { auth, getCurrentUser, login, loginWithSteam, logout, register } from "@/services/firebase";
import { onAuthStateChanged } from "firebase/auth";

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
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    
    loadUser();

    // Set up auth state change listener
    const unsubscribe = onAuthStateChanged(auth, async () => {
      const updatedUser = await getCurrentUser();
      setUser(updatedUser);
      setIsLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await login(email, password);
      setUser(user);
      return user;
    } catch (error) {
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
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithSteam = async () => {
    try {
      await loginWithSteam();
    } catch (error) {
      console.error("Steam login error:", error);
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
