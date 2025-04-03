
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Supabase client setup
// In Vite, we only use import.meta.env, not process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide default values to prevent the error when environment variables aren't available yet
const safeSupabaseUrl = supabaseUrl || 'https://your-project-url.supabase.co';
const safeSupabaseAnonKey = supabaseAnonKey || 'your-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // Adding a more detailed log for debugging
  console.log('Environment variables state:', {
    supabaseUrl: supabaseUrl ? 'defined' : 'undefined',
    supabaseAnonKey: supabaseAnonKey ? 'defined' : 'undefined'
  });
}

export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey);

// API Keys table structure in Supabase:
// - id: uuid (primary key)
// - name: string (e.g., 'steam_api_key', 'bymykel_api_url')
// - value: string (the actual API key or URL)
// - created_at: timestamp

// API Key management functions
export const getApiKey = async (name: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('value')
      .eq('name', name)
      .single();

    if (error) {
      console.error('Error fetching API key:', error);
      return null;
    }

    return data?.value || null;
  } catch (error) {
    console.error('Error in getApiKey:', error);
    return null;
  }
};

export const setApiKey = async (name: string, value: string): Promise<boolean> => {
  try {
    // Check if key already exists
    const { data: existingKey } = await supabase
      .from('api_keys')
      .select('id')
      .eq('name', name)
      .single();

    if (existingKey) {
      // Update existing key
      const { error } = await supabase
        .from('api_keys')
        .update({ value })
        .eq('name', name);

      if (error) {
        console.error('Error updating API key:', error);
        toast.error('Failed to update API key');
        return false;
      }
    } else {
      // Insert new key
      const { error } = await supabase
        .from('api_keys')
        .insert({ name, value });

      if (error) {
        console.error('Error inserting API key:', error);
        toast.error('Failed to save API key');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in setApiKey:', error);
    return false;
  }
};

// Skins database functions
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
      toast.error('Failed to save skin data to database');
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
