
import { SkinApiItem, Skin } from "@/types";
import { toast } from "sonner";

// API endpoints
const SKINS_API_URL = "https://bymykel.github.io/CSGO-API/api/pt-BR/skins.json";
const STEAM_INVENTORY_API_URL = "https://steamcommunity.com/profiles/{steamid64}/inventory/json/730/2";

// Local storage keys
const LOCAL_SKINS_KEY = "skinculator_local_skins";
const STEAM_SKINS_KEY = "skinculator_steam_skins";

export const fetchAllSkins = async (): Promise<SkinApiItem[]> => {
  try {
    const response = await fetch(SKINS_API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch skins");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching skins:", error);
    toast.error("Failed to fetch skins database");
    return [];
  }
};

export const fetchSteamInventory = async (steamId: string): Promise<Skin[]> => {
  try {
    // In a real app, this would call the Steam API with proper authentication
    // For demo purposes, we'll return mock data
    toast.info("Fetching Steam inventory (demo)...");
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return cached Steam skins if available
    const cachedSkins = localStorage.getItem(`${STEAM_SKINS_KEY}_${steamId}`);
    if (cachedSkins) {
      return JSON.parse(cachedSkins);
    }
    
    // Mock data for demo
    const mockSteamSkins: Skin[] = [
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
        userId: "user1"
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
        userId: "user1"
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
        userId: "user1"
      }
    ];
    
    // Save to local storage
    localStorage.setItem(`${STEAM_SKINS_KEY}_${steamId}`, JSON.stringify(mockSteamSkins));
    
    return mockSteamSkins;
  } catch (error) {
    console.error("Error fetching Steam inventory:", error);
    toast.error("Failed to fetch Steam inventory");
    return [];
  }
};

export const getLocalSkins = (userId: string): Skin[] => {
  try {
    const storedSkins = localStorage.getItem(`${LOCAL_SKINS_KEY}_${userId}`);
    if (storedSkins) {
      return JSON.parse(storedSkins);
    }
    return [];
  } catch (error) {
    console.error("Error getting local skins:", error);
    return [];
  }
};

export const addLocalSkin = (userId: string, skin: Omit<Skin, "id" | "userId" | "source">): Skin => {
  try {
    const localSkins = getLocalSkins(userId);
    
    const newSkin: Skin = {
      ...skin,
      id: `local_${Date.now()}`,
      userId,
      source: "local",
      exterior: calculateExterior(skin.float)
    };
    
    const updatedSkins = [...localSkins, newSkin];
    localStorage.setItem(`${LOCAL_SKINS_KEY}_${userId}`, JSON.stringify(updatedSkins));
    
    return newSkin;
  } catch (error) {
    console.error("Error adding local skin:", error);
    toast.error("Failed to add skin");
    throw error;
  }
};

export const removeLocalSkin = (userId: string, skinId: string): void => {
  try {
    const localSkins = getLocalSkins(userId);
    const updatedSkins = localSkins.filter(skin => skin.id !== skinId);
    localStorage.setItem(`${LOCAL_SKINS_KEY}_${userId}`, JSON.stringify(updatedSkins));
  } catch (error) {
    console.error("Error removing local skin:", error);
    toast.error("Failed to remove skin");
    throw error;
  }
};

export const calculateExterior = (float?: number): string | undefined => {
  if (float === undefined) return undefined;
  
  if (float >= 0 && float < 0.07) return "Nova de Fábrica";
  if (float >= 0.07 && float < 0.15) return "Pouco Usada";
  if (float >= 0.15 && float < 0.38) return "Testada em Campo";
  if (float >= 0.38 && float < 0.45) return "Bem Desgastada";
  if (float >= 0.45 && float <= 1) return "Veterana de Guerra";
  
  return undefined;
};

export const exportInventoryToJson = (userId: string): void => {
  const localSkins = getLocalSkins(userId);
  
  const dataStr = JSON.stringify(localSkins, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `skinculator_inventory_${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};
