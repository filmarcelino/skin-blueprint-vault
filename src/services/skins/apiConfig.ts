
import { getByMykelApiUrl as getFirebaseMykelApiUrl } from "../firebase";
import { toast } from "sonner";

// API configuration
let byMykelApiUrl: string = "https://bymykel.github.io/CSGO-API/api/pt-BR/skins.json";

// Initialize API URLs from Firebase
export const initApiConfig = async (): Promise<void> => {
  try {
    // We'll fetch the URL from Firebase config
    const configUrl = await getFirebaseMykelApiUrl();
    if (configUrl) {
      byMykelApiUrl = configUrl;
    }
    console.log("API config initialized successfully");
  } catch (error) {
    console.error("Error initializing API config:", error);
    toast.error("Falha ao inicializar configuração da API. Usando dados de fallback.");
  }
};

// Get the current API URL
export const getByMykelApiUrl = (): string => byMykelApiUrl;
