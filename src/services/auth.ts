
import { toast } from "sonner";
import { supabase } from "./supabase";
import { User } from "@/types";

export const getCurrentUser = async (): Promise<User | null> => {
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
  try {
    // Get the current URL to use as redirect URL
    const redirectTo = window.location.origin;

    // Generate the Steam login URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "steam",
      options: {
        redirectTo
      }
    });

    if (error) {
      toast.error(`Steam login failed: ${error.message}`);
      return;
    }

    // If URL is available, redirect to Steam auth page
    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Error in Steam login:", error);
    toast.error("Steam login failed. Please try again.");
  }
};

export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  } catch (error) {
    console.error("Error in logout:", error);
    toast.error("Logout failed");
  }
};

export const initAuth = async (): Promise<void> => {
  try {
    // This will set up auth state change listener
    const { data } = await supabase.auth.getSession();
    
    // If user has logged in with Steam, update profile with Steam data
    if (data.session?.user?.app_metadata?.provider === 'steam') {
      updateSteamUserProfile(data.session.user.id);
    }
  } catch (error) {
    console.error("Failed to initialize auth:", error);
  }
};

// Helper function to update user profile with Steam data
const updateSteamUserProfile = async (userId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.user_metadata.steamid64) return;
    
    const steamId = user.user_metadata.steamid64;
    
    // Fetch Steam API key from config
    const steamApiKey = await getSteamApiKey();
    
    // Fetch user data from Steam API
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Steam profile data');
    }
    
    const steamData = await response.json();
    
    if (steamData.response && steamData.response.players && steamData.response.players.length > 0) {
      const playerData = steamData.response.players[0];
      
      // Update user metadata
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

// Function to get the Steam API key from the config table
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
