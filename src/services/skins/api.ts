
import { SkinApiItem } from "@/types";
import { toast } from "sonner";
import { getByMykelApiUrl, getSkinDatabase, saveSkinData } from "../supabase";

// Initialize API URLs from Supabase
export const initApiConfig = async () => {
  try {
    // We'll fetch the URL from Supabase config table
    await getByMykelApiUrl();
  } catch (error) {
    console.error("Error initializing API config:", error);
  }
};

// Fetch all skins from database or API
export const fetchAllSkins = async (): Promise<SkinApiItem[]> => {
  try {
    // First try to get from Supabase database
    const dbSkins = await getSkinDatabase();
    if (dbSkins && dbSkins.length > 0) {
      console.log(`Loaded ${dbSkins.length} skins from database`);
      return dbSkins;
    }
    
    // If not available, fetch from ByMykel API
    const byMykelApiUrl = await getByMykelApiUrl();
    const response = await fetch(byMykelApiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch skins");
    }
    
    const skins = await response.json();
    console.log(`Fetched ${skins.length} skins from API`);
    
    // Save to Supabase database for future use
    saveSkinData(skins).then(success => {
      if (success) {
        toast.success(`Saved ${skins.length} skins to database`);
      }
    });
    
    return skins;
  } catch (error) {
    console.error("Error fetching skins:", error);
    toast.error("Failed to fetch skins database");
    return [];
  }
};

// Find a specific skin by name
export const findSkinByName = async (name: string): Promise<SkinApiItem | null> => {
  try {
    const allSkins = await fetchAllSkins();
    const skin = allSkins.find(s => 
      s.name.toLowerCase() === name.toLowerCase() ||
      s.name.toLowerCase().includes(name.toLowerCase())
    );
    return skin || null;
  } catch (error) {
    console.error("Error finding skin by name:", error);
    return null;
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
