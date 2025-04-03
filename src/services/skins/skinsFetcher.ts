
import { SkinApiItem } from "@/types";
import { toast } from "sonner";
import { getSkinDatabase, saveSkinData } from "../firebase";
import { getByMykelApiUrl } from "./apiConfig";
import { getCachedSkins, updateSkinsCache, FALLBACK_SKINS } from "./skinsCache";

// Fetch all skins from database or API
export const fetchAllSkins = async (): Promise<SkinApiItem[]> => {
  try {
    // Check if we have a valid cache
    const { skins: cachedSkins, isCacheValid } = getCachedSkins();
    if (isCacheValid) {
      console.log(`Using ${cachedSkins!.length} cached skins`);
      return cachedSkins!;
    }
    
    // First try to get from Firebase database
    console.log("Attempting to fetch skins from database...");
    const dbSkins = await getSkinDatabase();
    if (dbSkins && Array.isArray(dbSkins) && dbSkins.length > 0) {
      console.log(`Loaded ${dbSkins.length} skins from database`);
      
      // Validate skin data structure
      const validSkins = dbSkins.filter(skin => 
        skin && 
        typeof skin === 'object' && 
        typeof skin.name === 'string'
      );
      
      // Update cache
      updateSkinsCache(validSkins);
      
      return validSkins;
    }
    
    // If not available, fetch from ByMykel API
    console.log("Database empty or invalid, fetching from API...");
    const byMykelApiUrl = getByMykelApiUrl();
    console.log("Using API URL:", byMykelApiUrl);
    
    const response = await fetch(byMykelApiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch skins: ${response.status} ${response.statusText}`);
    }
    
    const skins = await response.json();
    console.log(`Fetched ${skins.length} skins from API`);
    
    // Validate the data structure
    if (!Array.isArray(skins)) {
      console.error("API returned invalid data format (not an array)");
      return FALLBACK_SKINS;
    }
    
    // Validar e limpar os dados
    const validSkins = skins.filter(skin => 
      skin && 
      typeof skin === 'object' && 
      typeof skin.name === 'string' && 
      skin.weapon !== undefined && 
      skin.category !== undefined
    );
    
    console.log(`Validated ${validSkins.length} skins from API`);
    
    // Update cache
    updateSkinsCache(validSkins);
    
    // Save to Firebase database for future use
    saveSkinData(validSkins).then(success => {
      if (success) {
        toast.success(`Salvos ${validSkins.length} skins no banco de dados`);
      } else {
        console.warn("Failed to save skins to database");
      }
    });
    
    return validSkins;
  } catch (error) {
    console.error("Error fetching skins:", error);
    toast.error("Falha ao buscar banco de dados de skins, usando dados de fallback");
    
    // Se já temos um cache, use-o mesmo que expirado
    const { skins: cachedSkins } = getCachedSkins();
    if (cachedSkins && cachedSkins.length > 0) {
      console.log(`Using ${cachedSkins.length} expired cached skins due to error`);
      return cachedSkins;
    }
    
    // Return fallback data if everything fails
    return FALLBACK_SKINS;
  }
};

// Download skins database as JSON file
export const downloadSkinsData = async (): Promise<void> => {
  try {
    toast.info("Downloading skins database...");
    const skins = await fetchAllSkins();
    
    if (skins.length === 0) {
      toast.error("No skins data available to download");
      return;
    }
    
    // Save to file
    const dataStr = JSON.stringify(skins, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `cs2_skins_database_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast.success(`Downloaded ${skins.length} skins data`);
  } catch (error) {
    console.error("Error downloading skins data:", error);
    toast.error("Failed to download skins data");
  }
};
