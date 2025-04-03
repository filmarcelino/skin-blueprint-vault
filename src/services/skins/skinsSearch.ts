
import { SkinApiItem } from "@/types";
import { toast } from "sonner";
import { fetchAllSkins } from "./skinsFetcher";

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
        return String(s.weapon).toLowerCase() === normalizedSearchName || 
               String(s.weapon).toLowerCase().includes(normalizedSearchName);
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
          weaponName = String(skin.weapon);
        }
      }
      
      // Handle category being an object or string
      let categoryName = "Unknown";
      if (skin.category) {
        if (typeof skin.category === 'string') {
          categoryName = skin.category;
        } else {
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
          rarityName = String(skin.rarity);
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
    return [];
  }
};
