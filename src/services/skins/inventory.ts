
import { Skin } from "@/types";
import { toast } from "sonner";
import { LOCAL_SKINS_KEY, STEAM_SKINS_KEY, calculateExterior, getLocalSkins } from "./utils";

// Add a skin to local inventory
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

// Remove a skin from local inventory
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

// Fetch user's Steam inventory
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
