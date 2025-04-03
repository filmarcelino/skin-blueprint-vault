
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Supabase client setup
// In Vite, we only use import.meta.env, not process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // Adding a more detailed log for debugging
  console.log('Environment variables state:', {
    supabaseUrl: supabaseUrl ? 'defined' : 'undefined',
    supabaseAnonKey: supabaseAnonKey ? 'defined' : 'undefined'
  });
}

// Create Supabase client with error handling
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Steam API key and ByMykel API URL
const STEAM_API_KEY_NAME = 'steam_api_key';
const BYMYKEL_API_URL_NAME = 'bymykel_api_url';

// Default values
const DEFAULT_STEAM_API_KEY = '2A3C7842A41375B31B81635F6AEB341D';
const DEFAULT_BYMYKEL_API_URL = 'https://bymykel.github.io/CSGO-API/api/pt-BR/skins.json';

// Config functions
export const getConfigValue = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.error(`Error fetching ${key}:`, error);
      
      // Return default values if fetch fails
      if (key === STEAM_API_KEY_NAME) return DEFAULT_STEAM_API_KEY;
      if (key === BYMYKEL_API_URL_NAME) return DEFAULT_BYMYKEL_API_URL;
      
      return null;
    }

    return data?.value || null;
  } catch (error) {
    console.error(`Error in getConfigValue for ${key}:`, error);
    
    // Return default values if fetch fails
    if (key === STEAM_API_KEY_NAME) return DEFAULT_STEAM_API_KEY;
    if (key === BYMYKEL_API_URL_NAME) return DEFAULT_BYMYKEL_API_URL;
    
    return null;
  }
};

export const setConfigValue = async (key: string, value: string): Promise<boolean> => {
  try {
    // Check if key already exists
    const { data: existingKey } = await supabase
      .from('config')
      .select('key')
      .eq('key', key)
      .single();

    if (existingKey) {
      // Update existing key
      const { error } = await supabase
        .from('config')
        .update({ value })
        .eq('key', key);

      if (error) {
        console.error(`Error updating ${key}:`, error);
        toast.error(`Failed to update ${key}`);
        return false;
      }
    } else {
      // Insert new key
      const { error } = await supabase
        .from('config')
        .insert({ key, value });

      if (error) {
        console.error(`Error inserting ${key}:`, error);
        toast.error(`Failed to save ${key}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`Error in setConfigValue for ${key}:`, error);
    return false;
  }
};

// Initialize config table with default values if not already set
export const initializeConfigTable = async (): Promise<void> => {
  try {
    // Check if Steam API key exists
    const steamApiKey = await getConfigValue(STEAM_API_KEY_NAME);
    if (!steamApiKey) {
      await setConfigValue(STEAM_API_KEY_NAME, DEFAULT_STEAM_API_KEY);
    }
    
    // Check if ByMykel API URL exists
    const bymykelApiUrl = await getConfigValue(BYMYKEL_API_URL_NAME);
    if (!bymykelApiUrl) {
      await setConfigValue(BYMYKEL_API_URL_NAME, DEFAULT_BYMYKEL_API_URL);
    }
  } catch (error) {
    console.error('Error initializing config table:', error);
  }
};

// Get API keys from config table
export const getSteamApiKey = async (): Promise<string> => {
  return (await getConfigValue(STEAM_API_KEY_NAME)) || DEFAULT_STEAM_API_KEY;
};

export const getByMykelApiUrl = async (): Promise<string> => {
  return (await getConfigValue(BYMYKEL_API_URL_NAME)) || DEFAULT_BYMYKEL_API_URL;
};

// User profile functions for Steam integration
export const updateUserProfileWithSteam = async (
  steamId: string, 
  avatarUrl: string, 
  username: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        steamid64: steamId,
        avatar_url: avatarUrl,
        username: username
      }
    });

    if (error) {
      console.error('Error updating user profile with Steam data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserProfileWithSteam:', error);
    return false;
  }
};

// Local inventory functions
export const addSkinToLocalInventory = async (skinData: {
  name: string;
  weapon: string;
  category: string;
  rarity: string;
  float_value: number;
  stattrak: boolean;
  souvenir: boolean;
  image_url: string;
}): Promise<boolean> => {
  try {
    // Calculate exterior based on float value
    const exterior = calculateExteriorFromFloat(skinData.float_value);
    
    const { error } = await supabase
      .from('local_inventory')
      .insert({
        ...skinData,
        exterior
      });

    if (error) {
      console.error('Error adding skin to local inventory:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addSkinToLocalInventory:', error);
    return false;
  }
};

export const getUserLocalInventory = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('local_inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user local inventory:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserLocalInventory:', error);
    return [];
  }
};

export const deleteSkinFromLocalInventory = async (skinId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('local_inventory')
      .delete()
      .eq('id', skinId);

    if (error) {
      console.error('Error deleting skin from local inventory:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSkinFromLocalInventory:', error);
    return false;
  }
};

// Helper function to calculate exterior based on float value
export const calculateExteriorFromFloat = (float: number): string => {
  if (float >= 0 && float < 0.07) return "Nova de Fábrica";
  if (float >= 0.07 && float < 0.15) return "Pouco Usada";
  if (float >= 0.15 && float < 0.38) return "Testada em Campo";
  if (float >= 0.38 && float < 0.45) return "Bem Desgastada";
  if (float >= 0.45 && float <= 1) return "Veterana de Guerra";
  return "Desconhecido";
};

// Skins database functions for ByMykel API integration
export const saveSkinData = async (skins: any[]): Promise<boolean> => {
  try {
    // Using upsert to handle both inserts and updates
    const { error } = await supabase
      .from('skins_database')
      .upsert(
        skins.map(skin => ({
          id: skin.id,
          name: skin.name,
          description: skin.description,
          weapon: skin.weapon,
          category: skin.category,
          pattern: skin.pattern,
          min_float: skin.min_float,
          max_float: skin.max_float,
          rarity: skin.rarity,
          image: skin.image
        })),
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Error saving skin data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveSkinData:', error);
    return false;
  }
};

export const getSkinDatabase = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('skins_database')
      .select('*');

    if (error) {
      console.error('Error fetching skin database:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSkinDatabase:', error);
    return [];
  }
};

// Initialize the config table when this module is imported
initializeConfigTable().catch(console.error);
