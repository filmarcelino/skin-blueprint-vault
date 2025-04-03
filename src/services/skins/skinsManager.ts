
import { toast } from "sonner";
import { SkinApiItem, DownloadStatus } from "@/types";
import { db } from "../firebase";
import { collection, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getByMykelApiUrl } from "../firebase";

// Constants
const SKINS_DOWNLOAD_STATUS_KEY = "skins_download_status";
const SKINS_BATCH_SIZE = 50;

// Default status
const DEFAULT_STATUS: DownloadStatus = {
  totalSkins: 0,
  downloadedSkins: 0,
  lastUpdated: "",
  isDownloading: false,
};

// Initialize the status document in Firestore if it doesn't exist
export const initializeSkinsManager = async (): Promise<void> => {
  try {
    const statusRef = doc(db, "config", SKINS_DOWNLOAD_STATUS_KEY);
    const statusDoc = await getDoc(statusRef);

    if (!statusDoc.exists()) {
      await setDoc(statusRef, DEFAULT_STATUS);
      console.log("Initialized skins download status document");
    }
  } catch (error) {
    console.error("Error initializing skins manager:", error);
  }
};

// Get the current download status
export const getDownloadStatus = async (): Promise<DownloadStatus> => {
  try {
    const statusRef = doc(db, "config", SKINS_DOWNLOAD_STATUS_KEY);
    const statusDoc = await getDoc(statusRef);

    if (!statusDoc.exists()) {
      await setDoc(statusRef, DEFAULT_STATUS);
      return DEFAULT_STATUS;
    }

    return statusDoc.data() as DownloadStatus;
  } catch (error) {
    console.error("Error getting download status:", error);
    return DEFAULT_STATUS;
  }
};

// Update the download status
export const updateDownloadStatus = async (update: Partial<DownloadStatus>): Promise<void> => {
  try {
    const statusRef = doc(db, "config", SKINS_DOWNLOAD_STATUS_KEY);
    await updateDoc(statusRef, update);
  } catch (error) {
    console.error("Error updating download status:", error);
  }
};

// Download all skins from the API and store them in Firebase
export const downloadAllSkins = async (): Promise<boolean> => {
  try {
    // Check if already downloading
    const currentStatus = await getDownloadStatus();
    if (currentStatus.isDownloading) {
      toast.info("Skin download already in progress");
      return false;
    }

    // Get API URL from config
    const byMykelApiUrl = await getByMykelApiUrl();
    if (!byMykelApiUrl) {
      toast.error("API URL not configured");
      return false;
    }

    // Start download
    await updateDownloadStatus({
      isDownloading: true,
      lastUpdated: new Date().toISOString(),
      error: undefined
    });

    toast.info("Downloading CS2 skins database...");

    // Fetch data from API
    const response = await fetch(byMykelApiUrl);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const skins: SkinApiItem[] = await response.json();

    // Update total count
    await updateDownloadStatus({
      totalSkins: skins.length,
      downloadedSkins: 0
    });

    // Process skins in batches
    const batches = Math.ceil(skins.length / SKINS_BATCH_SIZE);
    
    for (let i = 0; i < batches; i++) {
      const batchSkins = skins.slice(i * SKINS_BATCH_SIZE, (i + 1) * SKINS_BATCH_SIZE);
      
      // Process batch
      await Promise.all(batchSkins.map(async (skin) => {
        try {
          const skinRef = doc(db, "skins_database", skin.id || `skin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
          
          // Ensure we have valid data
          const sanitizedSkin: SkinApiItem = {
            id: skin.id || `skin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name: skin.name || "Unknown Skin",
            description: skin.description,
            weapon: skin.weapon || "Unknown",
            category: skin.category || "Unknown",
            pattern: skin.pattern,
            min_float: skin.min_float,
            max_float: skin.max_float,
            rarity: skin.rarity || "Common",
            image: skin.image || "/placeholder.svg"
          };
          
          await setDoc(skinRef, sanitizedSkin);
        } catch (error) {
          console.error(`Error saving skin ${skin.name}:`, error);
        }
      }));
      
      // Update progress
      const downloadedSoFar = Math.min((i + 1) * SKINS_BATCH_SIZE, skins.length);
      await updateDownloadStatus({
        downloadedSkins: downloadedSoFar,
        lastUpdated: new Date().toISOString()
      });
      
      // Update UI every batch
      toast.info(`Downloaded ${downloadedSoFar} of ${skins.length} skins...`);
    }
    
    // Finish download
    await updateDownloadStatus({
      isDownloading: false,
      lastUpdated: new Date().toISOString(),
      error: undefined
    });
    
    toast.success(`Successfully downloaded ${skins.length} skins to the database`);
    return true;
  } catch (error) {
    console.error("Error downloading skins:", error);
    
    // Update status with error
    await updateDownloadStatus({
      isDownloading: false,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
    
    toast.error(`Failed to download skins: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
};
