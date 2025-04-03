
import { SkinApiItem } from "@/types";

// Cache local para skins para evitar chamadas repetidas
let cachedSkins: SkinApiItem[] | null = null;
let lastCacheTime = 0;
export const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export const getCachedSkins = (): { 
  skins: SkinApiItem[] | null, 
  isCacheValid: boolean 
} => {
  const now = Date.now();
  const isCacheValid = cachedSkins && (now - lastCacheTime < CACHE_DURATION);
  return {
    skins: cachedSkins,
    isCacheValid
  };
};

export const updateSkinsCache = (skins: SkinApiItem[]): void => {
  cachedSkins = skins;
  lastCacheTime = Date.now();
};

// Fallback skin data in case API and database both fail
export const FALLBACK_SKINS: SkinApiItem[] = [
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
  },
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
