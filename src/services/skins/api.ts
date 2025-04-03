
import { SkinApiItem } from "@/types";
import { toast } from "sonner";
import { getByMykelApiUrl, getSkinDatabase, saveSkinData } from "../firebase";

// Fallback skin data in case API and database both fail
const FALLBACK_SKINS: SkinApiItem[] = [
  {
    id: "fallback_1",
    name: "AK-47 | Redline",
    description: "High-performance assault rifle with a distinctive red and black finish",
    weapon: "AK-47",
    category: "Rifle",
    pattern: "Redline",
    min_float: 0.1,
    max_float: 0.7,
    rarity: "Classified",
    image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_ak47_cobra_light_large.7494bfdf4855fd4e6a2dbd983ed0a243c80ef830.png"
  },
  {
    id: "fallback_2",
    name: "AWP | Asiimov",
    description: "High-damage sniper rifle with futuristic white/orange design",
    weapon: "AWP",
    category: "Sniper Rifle",
    pattern: "Asiimov",
    min_float: 0.18,
    max_float: 1.0,
    rarity: "Covert",
    image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_awp_cu_awp_asimov_light_large.32d9045f8a2bcd13ca18438389785a6aa7dbe5d7.png"
  },
  {
    id: "fallback_3",
    name: "M4A4 | Howl",
    description: "Contraband assault rifle with a howling wolf design",
    weapon: "M4A4",
    category: "Rifle",
    pattern: "Howl",
    min_float: 0.0,
    max_float: 0.4,
    rarity: "Contraband",
    image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_cu_m4a1_howl_light_large.5e423728f8bfdbfc9a3646728a521742d0971f38.png"
  }
];

// Initialize API URLs from Firebase
export const initApiConfig = async () => {
  try {
    // We'll fetch the URL from Firebase config
    await getByMykelApiUrl();
  } catch (error) {
    console.error("Error initializing API config:", error);
  }
};

// Fetch all skins from database or API
export const fetchAllSkins = async (): Promise<SkinApiItem[]> => {
  try {
    // First try to get from Firebase database
    console.log("Attempting to fetch skins from database...");
    const dbSkins = await getSkinDatabase();
    if (dbSkins && dbSkins.length > 0) {
      console.log(`Loaded ${dbSkins.length} skins from database`);
      return dbSkins;
    }
    
    // If not available, fetch from ByMykel API
    console.log("Database empty, fetching from API...");
    const byMykelApiUrl = await getByMykelApiUrl();
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
    
    // Save to Firebase database for future use
    saveSkinData(skins).then(success => {
      if (success) {
        toast.success(`Saved ${skins.length} skins to database`);
      } else {
        console.warn("Failed to save skins to database");
      }
    });
    
    return skins;
  } catch (error) {
    console.error("Error fetching skins:", error);
    toast.error("Failed to fetch skins database, using fallback data");
    
    // Return fallback data if everything fails
    return FALLBACK_SKINS;
  }
};

// Find a specific skin by name
export const findSkinByName = async (name: string): Promise<SkinApiItem | null> => {
  try {
    const allSkins = await fetchAllSkins();
    const skin = allSkins.find(s => {
      if (!s || typeof s.name !== 'string') return false;
      return s.name.toLowerCase() === name.toLowerCase() || 
             s.name.toLowerCase().includes(name.toLowerCase());
    });
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
