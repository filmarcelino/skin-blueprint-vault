
import { Exterior, Skin } from "@/types";
import { toast } from "sonner";

// Local storage keys
export const LOCAL_SKINS_KEY = "skinculator_local_skins";
export const STEAM_SKINS_KEY = "skinculator_steam_skins";

// Calculate exterior based on float value
export const calculateExterior = (float?: number): string | undefined => {
  if (float === undefined) return undefined;
  
  if (float >= 0 && float < 0.07) return "Nova de Fábrica";
  if (float >= 0.07 && float < 0.15) return "Pouco Usada";
  if (float >= 0.15 && float < 0.38) return "Testada em Campo";
  if (float >= 0.38 && float < 0.45) return "Bem Desgastada";
  if (float >= 0.45 && float <= 1) return "Veterana de Guerra";
  
  return undefined;
};

// Export inventory to JSON file
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

// Get skins from local storage
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
