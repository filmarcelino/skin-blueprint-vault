import { Skin } from "@/types";
import { toast } from "sonner";
import { 
  calculateExteriorFromFloat, 
  getSteamApiKey, 
  getUserLocalInventory, 
  addSkinToLocalInventory, 
  deleteSkinFromLocalInventory 
} from "../firebase";
import { findSkinByName } from "./api";
import { LOCAL_SKINS_KEY, STEAM_SKINS_KEY } from "./utils";

// Add a skin to local inventory in Firebase
export const addLocalSkin = async (
  userId: string, 
  skinData: {
    name: string;
    weapon?: string;
    category?: string;
    rarity?: string;
    float?: number;
    stattrak: boolean;
    souvenir: boolean;
    imageUrl?: string;
  }
): Promise<Skin | null> => {
  try {
    console.log("Adding skin to inventory:", skinData);
    
    // Find the skin in the ByMykel API to get complete data
    const apiSkin = await findSkinByName(skinData.name);
    
    if (!apiSkin) {
      console.error(`Could not find skin data for "${skinData.name}"`);
      toast.error(`Could not find skin data for "${skinData.name}"`);
      
      // Create a skin with the data we have as fallback
      const fallbackSkin: Skin = {
        id: `local_${Date.now()}`,
        name: skinData.name,
        weapon: skinData.weapon || "Unknown",
        category: skinData.category || "Unknown",
        rarity: skinData.rarity || "Common",
        float: skinData.float,
        exterior: skinData.float ? calculateExteriorFromFloat(skinData.float) : undefined,
        stattrak: skinData.stattrak,
        souvenir: skinData.souvenir,
        imageUrl: skinData.imageUrl || "/placeholder.svg",
        source: "local",
        userId
      };
      
      // Store in localStorage as fallback
      const localSkins = getLocalSkinsFromStorage(userId);
      localSkins.push(fallbackSkin);
      saveLocalSkinsToStorage(userId, localSkins);
      
      return fallbackSkin;
    }
    
    console.log("Found skin in API:", apiSkin);
    
    // Add to Firebase local_inventory
    const success = await addSkinToLocalInventory(userId, {
      name: skinData.name,
      weapon: apiSkin.weapon || skinData.weapon || "Unknown",
      category: apiSkin.category || skinData.category || "Unknown",
      rarity: apiSkin.rarity || skinData.rarity || "Unknown",
      float_value: skinData.float || 0,
      stattrak: skinData.stattrak,
      souvenir: skinData.souvenir,
      image_url: apiSkin.image || skinData.imageUrl || ""
    });
    
    if (!success) {
      console.error("Failed to add skin to Firebase inventory");
      toast.error("Failed to add skin to inventory");
      
      // Fall back to localStorage
      const localSkin: Skin = {
        id: `local_${Date.now()}`,
        name: skinData.name,
        weapon: apiSkin.weapon || skinData.weapon || "Unknown",
        category: apiSkin.category || skinData.category || "Unknown",
        rarity: apiSkin.rarity || skinData.rarity || "Unknown",
        float: skinData.float,
        exterior: skinData.float ? calculateExteriorFromFloat(skinData.float) : undefined,
        stattrak: skinData.stattrak,
        souvenir: skinData.souvenir,
        imageUrl: apiSkin.image || skinData.imageUrl || "/placeholder.svg",
        source: "local",
        userId
      };
      
      const localSkins = getLocalSkinsFromStorage(userId);
      localSkins.push(localSkin);
      saveLocalSkinsToStorage(userId, localSkins);
      
      return localSkin;
    }
    
    // Get the newly added skin from the database
    const userSkins = await getUserLocalInventory(userId);
    const newSkin = userSkins.length > 0 ? userSkins[0] : null;
    
    if (!newSkin) {
      console.error("Failed to retrieve newly added skin");
      return null;
    }
    
    // Convert to the app's Skin type
    const convertedSkin: Skin = {
      id: newSkin.id,
      name: newSkin.name,
      weapon: newSkin.weapon,
      category: newSkin.category,
      rarity: newSkin.rarity,
      float: newSkin.float_value,
      exterior: newSkin.exterior,
      stattrak: newSkin.stattrak,
      souvenir: newSkin.souvenir,
      imageUrl: newSkin.image_url,
      source: "local",
      userId
    };
    
    return convertedSkin;
  } catch (error) {
    console.error("Error adding local skin:", error);
    toast.error("Failed to add skin");
    return null;
  }
};

// Helper functions to manage local storage as fallback
const getLocalSkinsFromStorage = (userId: string): Skin[] => {
  try {
    const data = localStorage.getItem(`${LOCAL_SKINS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading from localStorage:", e);
    return [];
  }
};

const saveLocalSkinsToStorage = (userId: string, skins: Skin[]) => {
  try {
    localStorage.setItem(`${LOCAL_SKINS_KEY}_${userId}`, JSON.stringify(skins));
  } catch (e) {
    console.error("Error writing to localStorage:", e);
  }
};

// Remove a skin from local inventory in Firebase
export const removeLocalSkin = async (userId: string, skinId: string): Promise<boolean> => {
  try {
    // Try Firebase first
    const success = await deleteSkinFromLocalInventory(skinId);
    
    // If Firebase fails, try localStorage
    if (!success) {
      const localSkins = getLocalSkinsFromStorage(userId);
      const updatedSkins = localSkins.filter(skin => skin.id !== skinId);
      saveLocalSkinsToStorage(userId, updatedSkins);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error removing local skin:", error);
    toast.error("Failed to remove skin");
    
    // Try localStorage as fallback
    try {
      const localSkins = getLocalSkinsFromStorage(userId);
      const updatedSkins = localSkins.filter(skin => skin.id !== skinId);
      saveLocalSkinsToStorage(userId, updatedSkins);
      return true;
    } catch (e) {
      console.error("Fallback removal failed:", e);
      return false;
    }
  }
};

// Get user's local inventory from Firebase
export const getLocalSkins = async (userId: string): Promise<Skin[]> => {
  try {
    const skins = await getUserLocalInventory(userId);
    
    // Convert to the app's Skin type
    return skins.map(skin => ({
      id: skin.id,
      name: skin.name,
      weapon: skin.weapon,
      category: skin.category,
      rarity: skin.rarity,
      float: skin.float_value,
      exterior: skin.exterior,
      stattrak: skin.stattrak,
      souvenir: skin.souvenir,
      imageUrl: skin.image_url,
      source: "local",
      userId
    }));
  } catch (error) {
    console.error("Error getting local skins:", error);
    return [];
  }
};

// Fetch user's Steam inventory
export const fetchSteamInventory = async (steamId: string): Promise<Skin[]> => {
  try {
    toast.info("Fetching Steam inventory...");
    
    // Get Steam API key from config
    const steamApiKey = await getSteamApiKey();
    
    // Fetch inventory from Steam API
    const response = await fetch(
      `https://steamcommunity.com/profiles/${steamId}/inventory/json/730/2`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Steam inventory: ${response.statusText}`);
    }
    
    const inventoryData = await response.json();
    
    if (!inventoryData.success) {
      throw new Error("Steam inventory is not available or is private");
    }
    
    // Parse the response to extract skins
    const steamSkins: Skin[] = [];
    
    const { descriptions, assets } = inventoryData;
    
    // Process each item in the inventory
    for (const assetId in assets) {
      const asset = assets[assetId];
      const description = descriptions[asset.classid + '_' + asset.instanceid];
      
      if (!description) continue;
      
      // Skip non-skins (cases, stickers, etc)
      if (!isCSSkin(description)) continue;
      
      // Extract skin data
      const name = description.market_name || description.name || "";
      let weapon = "Unknown";
      let skinName = "";
      
      // Parse weapon and skin name from market name (e.g., "AK-47 | Asiimov")
      const nameParts = name.split(" | ");
      if (nameParts.length >= 2) {
        weapon = nameParts[0];
        skinName = nameParts[1];
      }
      
      // Extract exterior, StatTrak, Souvenir
      let exterior = "Unknown";
      let stattrak = false;
      let souvenir = false;
      let category = "Unknown";
      let rarity = "Unknown";
      
      // Process tags to extract metadata
      if (description.tags) {
        for (const tag of description.tags) {
          // Get exterior
          if (tag.category === "Exterior") {
            exterior = tag.name;
          }
          
          // Get weapon category
          if (tag.category === "Type") {
            category = tag.name;
          }
          
          // Get rarity
          if (tag.category === "Rarity") {
            rarity = tag.name;
          }
        }
        
        // Check for StatTrak or Souvenir
        stattrak = name.includes("StatTrak™");
        souvenir = name.includes("Souvenir");
      }
      
      // Create skin object
      steamSkins.push({
        id: `steam_${assetId}`,
        name,
        weapon,
        category,
        rarity,
        exterior,
        stattrak,
        souvenir,
        imageUrl: `https://steamcommunity-a.akamaihd.net/economy/image/${description.icon_url}/360fx360f`,
        source: "steam",
        userId: steamId
      });
    }
    
    // Cache the results in localStorage for offline usage
    localStorage.setItem(`${STEAM_SKINS_KEY}_${steamId}`, JSON.stringify(steamSkins));
    
    return steamSkins;
  } catch (error) {
    console.error("Error fetching Steam inventory:", error);
    toast.error("Failed to fetch Steam inventory. Using cached data if available.");
    
    // Try to return cached data if available
    try {
      const cachedSkins = localStorage.getItem(`${STEAM_SKINS_KEY}_${steamId}`);
      if (cachedSkins) {
        return JSON.parse(cachedSkins);
      }
    } catch (e) {
      console.error("Error parsing cached Steam inventory:", e);
    }
    
    // Fallback to demo data in development
    if (import.meta.env.DEV) {
      return getDemoSteamInventory(steamId);
    }
    
    return [];
  }
};

// Helper function to determine if an item is a CS2 skin (not a case, sticker, etc.)
const isCSSkin = (item: any): boolean => {
  if (!item.tags) return false;
  
  // Check for weapon category tags
  const weaponCategories = ["Pistol", "Rifle", "SMG", "Shotgun", "Sniper Rifle", "Machinegun", "Knife"];
  
  for (const tag of item.tags) {
    if (tag.category === "Type" && weaponCategories.includes(tag.name)) {
      return true;
    }
  }
  
  return false;
};

// For development/demo purposes
const getDemoSteamInventory = (userId: string): Skin[] => {
  return [
    {
      id: "steam_1",
      name: "AK-47 | Asiimov",
      weapon: "AK-47",
      category: "Rifle",
      rarity: "Covert",
      exterior: "Testada em Campo",
      stattrak: true,
      souvenir: false,
      imageUrl: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjQO3-UdsZGHyd4_Bd1RvNQ7T_FDrw-_ng5K4u57NmyA27iJx7S3D30vgIuUJHQ/360fx360f",
      source: "steam",
      userId
    },
    {
      id: "steam_2",
      name: "AWP | Wildfire",
      weapon: "AWP",
      category: "Sniper Rifle",
      rarity: "Covert",
      exterior: "Nova de Fábrica",
      stattrak: false,
      souvenir: false,
      imageUrl: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2G9SupUijOjAotyg3w2x_0ZkZ2rzd4OXdgRoYQuE8wO5xOy6jMK5tJ7XiSw0WqKv8kM/360fx360f",
      source: "steam",
      userId
    },
    {
      id: "steam_3",
      name: "Desert Eagle | Code Red",
      weapon: "Desert Eagle",
      category: "Pistol",
      rarity: "Covert",
      exterior: "Pouco Usada",
      stattrak: false,
      souvenir: false,
      imageUrl: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PLZTjlH_9mkgL-OlvD4NoTCk29X6Zws3OrHptitigXk-EZrNmr6coPGJwdtMFqG8lK6k-vv0Z-96M_BnSRr7Cg8pSGKJqtYDJQ/360fx360f",
      source: "steam",
      userId
    }
  ];
};
