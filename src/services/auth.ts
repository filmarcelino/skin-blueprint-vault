
import { toast } from "sonner";
import { User } from "@/types";

// Mock authentication service (would connect to Firebase/Supabase in production)
let currentUser: User | null = null;

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    // In a real app, this would authenticate with Firebase/Supabase
    // For demo purposes, we'll just simulate a successful login
    currentUser = {
      id: "user1",
      email,
      displayName: email.split('@')[0],
      avatarUrl: "",
    };
    
    localStorage.setItem("user", JSON.stringify(currentUser));
    return currentUser;
  } catch (error) {
    toast.error("Login failed. Please try again.");
    return null;
  }
};

export const register = async (email: string, password: string): Promise<User | null> => {
  try {
    // In a real app, this would register with Firebase/Supabase
    // For demo purposes, we'll just simulate a successful registration
    currentUser = {
      id: "user1",
      email,
      displayName: email.split('@')[0],
      avatarUrl: "",
    };
    
    localStorage.setItem("user", JSON.stringify(currentUser));
    return currentUser;
  } catch (error) {
    toast.error("Registration failed. Please try again.");
    return null;
  }
};

export const loginWithSteam = async (): Promise<void> => {
  // In a real app, this would redirect to Steam OpenID
  // For demo purposes, we'll just show a toast
  toast.info("Steam login would open here. This is a demo feature.");
};

export const logout = (): void => {
  currentUser = null;
  localStorage.removeItem("user");
};

export const initAuth = (): void => {
  const userJson = localStorage.getItem("user");
  if (userJson) {
    try {
      currentUser = JSON.parse(userJson);
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
    }
  }
};
