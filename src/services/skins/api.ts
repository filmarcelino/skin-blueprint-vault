
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

// Adicionar mais skins de fallback populares para melhorar a experiência do usuário
const MORE_FALLBACK_SKINS: SkinApiItem[] = [
  {
    id: "fallback_4",
    name: "Desert Eagle | Blaze",
    description: "Powerful pistol with flames design",
    weapon: "Desert Eagle",
    category: "Pistol",
    pattern: "Blaze",
    min_float: 0.00,
    max_float: 0.08,
    rarity: "Classified",
    image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_deagle_aa_flames_light_large.dd740d54f77b5928b93da525b7b26dca2a50a49d.png"
  },
  {
    id: "fallback_5",
    name: "M4A1-S | Hyper Beast",
    description: "Silenced rifle with colorful beast artwork",
    weapon: "M4A1-S",
    category: "Rifle",
    pattern: "Hyper Beast",
    min_float: 0.00,
    max_float: 1.00,
    rarity: "Covert",
    image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_m4a1_silencer_cu_m4a1s_hyper_beast_light_large.31850937661935a062d5f6fec19a154c929f25fa.png"
  },
  {
    id: "fallback_6",
    name: "Karambit | Doppler",
    description: "Premium knife with galaxy pattern",
    weapon: "Karambit",
    category: "Knife",
    pattern: "Doppler",
    min_float: 0.00,
    max_float: 0.08,
    rarity: "Covert",
    image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_knife_karambit_am_doppler_phase1_light_large.7273368a31487d806aa5ae54655fa91a507ca9f1.png"
  }
];

// Combine todas as skins de fallback
const ALL_FALLBACK_SKINS = [...FALLBACK_SKINS, ...MORE_FALLBACK_SKINS];

// Cache local para skins para evitar chamadas repetidas
let cachedSkins: SkinApiItem[] | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

// Initialize API URLs from Firebase
export const initApiConfig = async () => {
  try {
    // We'll fetch the URL from Firebase config
    await getByMykelApiUrl();
    console.log("API config initialized successfully");
  } catch (error) {
    console.error("Error initializing API config:", error);
    toast.error("Falha ao inicializar configuração da API. Usando dados de fallback.");
  }
};

// Fetch all skins from database or API
export const fetchAllSkins = async (): Promise<SkinApiItem[]> => {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (cachedSkins && (now - lastCacheTime < CACHE_DURATION)) {
      console.log(`Using ${cachedSkins.length} cached skins`);
      return cachedSkins;
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
      cachedSkins = validSkins;
      lastCacheTime = now;
      
      return validSkins;
    }
    
    // If not available, fetch from ByMykel API
    console.log("Database empty or invalid, fetching from API...");
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
      return ALL_FALLBACK_SKINS;
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
    cachedSkins = validSkins;
    lastCacheTime = now;
    
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
    if (cachedSkins && cachedSkins.length > 0) {
      console.log(`Using ${cachedSkins.length} expired cached skins due to error`);
      return cachedSkins;
    }
    
    // Return fallback data if everything fails
    return ALL_FALLBACK_SKINS;
  }
};

// Find a specific skin by name
export const findSkinByName = async (name: string): Promise<SkinApiItem | null> => {
  try {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      console.warn("Invalid skin name provided to findSkinByName:", name);
      return null;
    }
    
    console.log(`Searching for skin with name: "${name}"`);
    const allSkins = await fetchAllSkins();
    
    // Melhorar o algoritmo de busca para ser mais tolerante
    const normalizedSearchName = name.toLowerCase().trim();
    
    // Primeiro, busca por correspondência exata
    let skin = allSkins.find(s => {
      if (!s || typeof s.name !== 'string') return false;
      return s.name.toLowerCase() === normalizedSearchName;
    });
    
    // Se não encontrar, busca por correspondência parcial
    if (!skin) {
      skin = allSkins.find(s => {
        if (!s || typeof s.name !== 'string') return false;
        return s.name.toLowerCase().includes(normalizedSearchName);
      });
    }
    
    // Se ainda não encontrar, tenta buscar apenas pelo nome da arma
    if (!skin) {
      skin = allSkins.find(s => {
        if (!s || !s.weapon || typeof s.weapon !== 'string') return false;
        return s.weapon.toLowerCase() === normalizedSearchName || 
               s.weapon.toLowerCase().includes(normalizedSearchName);
      });
    }
    
    if (skin) {
      console.log(`Found skin: ${skin.name}`);
    } else {
      console.log(`No skin found for: "${name}"`);
    }
    
    return skin || null;
  } catch (error) {
    console.error("Error finding skin by name:", error);
    toast.error(`Erro ao buscar skin "${name}"`);
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

// Método de pesquisa de skins para autocomplete
export const searchSkins = async (query: string): Promise<SkinApiItem[]> => {
  try {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return [];
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    console.log(`Searching skins with query: "${normalizedQuery}"`);
    
    // Garantir que temos as skins carregadas
    const allSkins = await fetchAllSkins();
    console.log(`Searching through ${allSkins.length} skins`);
    
    if (!allSkins || allSkins.length === 0) {
      console.warn("No skins available to search through");
      return [];
    }
    
    // Melhorar o algoritmo de busca para retornar resultados mais relevantes
    const matchedSkins = allSkins.filter(skin => {
      if (!skin || typeof skin !== 'object') return false;
      
      try {
        // Verificar nome da skin
        const nameMatch = skin.name && 
          typeof skin.name === 'string' && 
          skin.name.toLowerCase().includes(normalizedQuery);
        
        // Verificar nome da arma
        let weaponMatch = false;
        if (skin.weapon) {
          if (typeof skin.weapon === 'string') {
            weaponMatch = skin.weapon.toLowerCase().includes(normalizedQuery);
          } else {
            // Corrigindo o erro de TypeScript - evitando chamar toString() diretamente
            const weaponString = String(skin.weapon);
            weaponMatch = weaponString.toLowerCase().includes(normalizedQuery);
          }
        }
        
        // Verificar padrão da skin
        let patternMatch = false;
        if (skin.pattern) {
          if (typeof skin.pattern === 'string') {
            patternMatch = skin.pattern.toLowerCase().includes(normalizedQuery);
          } else {
            // Corrigindo o erro de TypeScript - evitando chamar toString() diretamente
            const patternString = String(skin.pattern);
            patternMatch = patternString.toLowerCase().includes(normalizedQuery);
          }
        }
        
        return nameMatch || weaponMatch || patternMatch;
      } catch (err) {
        console.error("Error filtering skin in search:", err, skin);
        return false;
      }
    });
    
    console.log(`Found ${matchedSkins.length} skins matching "${query}"`);
    
    // Normalizar os dados para garantir formato consistente
    const normalizedResults = matchedSkins.map(skin => {
      // Handle weapon being an object or string
      let weaponName = "Unknown";
      if (skin.weapon) {
        if (typeof skin.weapon === 'string') {
          weaponName = skin.weapon;
        } else {
          // Corrigindo o erro de TypeScript
          weaponName = String(skin.weapon);
        }
      }
      
      // Handle category being an object or string
      let categoryName = "Unknown";
      if (skin.category) {
        if (typeof skin.category === 'string') {
          categoryName = skin.category;
        } else {
          // Corrigindo o erro de TypeScript
          categoryName = String(skin.category);
        }
      }
      
      // Handle rarity being an object or string
      let rarityName = "Common";
      let rarityColor = "#9EA3B8";
      if (skin.rarity) {
        if (typeof skin.rarity === 'string') {
          rarityName = skin.rarity;
        } else {
          // Corrigindo o erro de TypeScript
          rarityName = String(skin.rarity);
          // Don't try to access color property directly as it might be undefined
          if (skin.rarity && typeof skin.rarity === 'object' && 'color' in skin.rarity) {
            const color = (skin.rarity as any).color;
            if (typeof color === 'string') rarityColor = color;
          }
        }
      }
      
      // Create normalized skin object with added rarityColor
      return {
        ...skin,
        weapon: weaponName,
        category: categoryName,
        rarity: rarityName,
        rarityColor: rarityColor
      };
    });
    
    // Limitar para 20 resultados para evitar sobrecarga
    return normalizedResults.slice(0, 20);
  } catch (error) {
    console.error("Error searching skins:", error);
    toast.error("Erro na pesquisa de skins");
    
    // Em caso de erro, retorne alguns resultados de fallback para query comum
    if (query.toLowerCase().includes("asiimov")) {
      return ALL_FALLBACK_SKINS.filter(skin => skin.name.includes("Asiimov"));
    } else if (query.toLowerCase().includes("redline")) {
      return ALL_FALLBACK_SKINS.filter(skin => skin.name.includes("Redline"));
    } else if (query.toLowerCase().includes("ak")) {
      return ALL_FALLBACK_SKINS.filter(skin => skin.weapon === "AK-47");
    } else if (query.toLowerCase().includes("awp")) {
      return ALL_FALLBACK_SKINS.filter(skin => skin.weapon === "AWP");
    }
    return [];
  }
};

// Iniciar o carregamento de skins logo na inicialização para garantir disponibilidade
(async () => {
  try {
    await fetchAllSkins();
  } catch (error) {
    console.error("Failed to preload skins:", error);
  }
})();
