import { toast } from "sonner";
import { supabase, isFallbackMode } from "./supabase";
import { User } from "@/types";

const LOCAL_USER_KEY = 'skinculator_user';

const saveUserToLocalStorage = (user: User): void => {
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
};

const getUserFromLocalStorage = (): User | null => {
  try {
    const user = localStorage.getItem(LOCAL_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (isFallbackMode) {
    return getUserFromLocalStorage();
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    return {
      id: user.id,
      email: user.email || "",
      displayName: user.user_metadata.username || user.email?.split("@")[0] || "",
      avatarUrl: user.user_metadata.avatar_url || "",
      steamId: user.user_metadata.steamid64,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User | null> => {
  if (isFallbackMode) {
    try {
      if (!email.includes('@') || password.length < 6) {
        toast.error('Invalid email or password');
        return null;
      }
      
      const mockUser: User = {
        id: `local_${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        avatarUrl: '',
        steamId: null,
      };
      
      saveUserToLocalStorage(mockUser);
      toast.success('Logged in successfully (Fallback Mode)');
      
      return mockUser;
    } catch (error) {
      toast.error('Login failed');
      return null;
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      return null;
    }

    if (!data.user) {
      toast.error("Login failed");
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email || "",
      displayName: data.user.user_metadata.username || data.user.email?.split("@")[0] || "",
      avatarUrl: data.user.user_metadata.avatar_url || "",
      steamId: data.user.user_metadata.steamid64,
    };
  } catch (error) {
    toast.error("Login failed. Please try again.");
    return null;
  }
};

export const register = async (email: string, password: string): Promise<User | null> => {
  if (isFallbackMode) {
    try {
      if (!email.includes('@') || password.length < 6) {
        toast.error('Invalid email or password. Password must be at least 6 characters.');
        return null;
      }
      
      const mockUser: User = {
        id: `local_${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        avatarUrl: '',
        steamId: null,
      };
      
      saveUserToLocalStorage(mockUser);
      toast.success('Registered successfully (Fallback Mode)');
      
      return mockUser;
    } catch (error) {
      toast.error('Registration failed');
      return null;
    }
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: email.split("@")[0],
        }
      }
    });

    if (error) {
      toast.error(error.message);
      return null;
    }

    if (!data.user) {
      toast.error("Registration failed");
      return null;
    }

    toast.success("Registration successful! Check your email to verify your account.");

    return {
      id: data.user.id,
      email: data.user.email || "",
      displayName: data.user.user_metadata.username || data.user.email?.split("@")[0] || "",
      avatarUrl: data.user.user_metadata.avatar_url || "",
      steamId: data.user.user_metadata.steamid64,
    };
  } catch (error) {
    toast.error("Registration failed. Please try again.");
    return null;
  }
};

export const loginWithSteam = async (): Promise<void> => {
  if (isFallbackMode) {
    try {
      const mockUser: User = {
        id: `steam_${Date.now()}`,
        email: `steam_user${Date.now()}@example.com`,
        displayName: `Steam User ${Math.floor(Math.random() * 1000)}`,
        avatarUrl: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
        steamId: '12345678901234567',
      };
      
      saveUserToLocalStorage(mockUser);
      toast.success('Logged in with Steam (Fallback Mode)');
      
      return;
    } catch (error) {
      toast.error('Steam login failed');
      return;
    }
  }
  
  try {
    const redirectTo = window.location.origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "steam" as any,
      options: {
        redirectTo
      }
    });

    if (error) {
      toast.error(`Steam login failed: ${error.message}`);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Error in Steam login:", error);
    toast.error("Steam login failed. Please try again.");
  }
};

export const logout = async (): Promise<void> => {
  if (isFallbackMode) {
    localStorage.removeItem(LOCAL_USER_KEY);
    toast.success("Logged out successfully");
    return;
  }
  
  try {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  } catch (error) {
    console.error("Error in logout:", error);
    toast.error("Logout failed");
  }
};

export const initAuth = async (): Promise<void> => {
  if (isFallbackMode) {
    return;
  }
  
  try {
    const { data } = await supabase.auth.getSession();
    
    if (data.session?.user?.app_metadata?.provider === 'steam') {
      updateSteamUserProfile(data.session.user.id);
    }
  } catch (error) {
    console.error("Failed to initialize auth:", error);
  }
};

const updateSteamUserProfile = async (userId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.user_metadata.steamid64) return;
    
    const steamId = user.user_metadata.steamid64;
    
    const steamApiKey = await getSteamApiKey();
    
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Steam profile data');
    }
    
    const steamData = await response.json();
    
    if (steamData.response && steamData.response.players && steamData.response.players.length > 0) {
      const playerData = steamData.response.players[0];
      
      await supabase.auth.updateUser({
        data: {
          username: playerData.personaname || user.user_metadata.username,
          avatar_url: playerData.avatarfull || user.user_metadata.avatar_url
        }
      });
    }
  } catch (error) {
    console.error('Error updating Steam user profile:', error);
  }
};

const getSteamApiKey = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'steam_api_key')
    .single();

  if (error || !data) {
    console.error('Error fetching Steam API key:', error);
    return '2A3C7842A41375B31B81635F6AEB341D'; // Default key
  }

  return data.value;
};
