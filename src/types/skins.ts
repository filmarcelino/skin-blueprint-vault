
import { SkinApiItem } from "@/types";

// Adiciona segurança de tipo para propriedades que podem não existir
export const getSkinProperty = <T>(
  skin: SkinApiItem, 
  property: keyof SkinApiItem, 
  fallback: T
): T => {
  if (!skin) return fallback;
  
  if (property in skin && skin[property] !== undefined && skin[property] !== null) {
    if (typeof skin[property] === 'object' && skin[property] !== null) {
      if ('name' in (skin[property] as any)) {
        return (skin[property] as any).name as T;
      }
      return String(skin[property]) as unknown as T;
    }
    return skin[property] as unknown as T;
  }
  return fallback;
};

export const getSkinName = (skin: SkinApiItem): string => {
  return getSkinProperty(skin, 'name', 'Unnamed Skin');
};

export const getSkinWeapon = (skin: SkinApiItem): string => {
  return getSkinProperty(skin, 'weapon', 'Unknown Weapon');
};

export const getSkinCategory = (skin: SkinApiItem): string => {
  return getSkinProperty(skin, 'category', 'Unknown Category');
};

export const getSkinRarity = (skin: SkinApiItem): string => {
  return getSkinProperty(skin, 'rarity', 'Common');
};

export const getSkinImage = (skin: SkinApiItem): string => {
  return getSkinProperty(skin, 'image', '/placeholder.svg');
};

// Função para calcular o exterior com base no float
export const calculateExteriorFromFloat = (float: number): string => {
  if (float < 0.07) return "Nova de Fábrica";
  if (float < 0.15) return "Pouco Usada";
  if (float < 0.38) return "Testada em Campo";
  if (float < 0.45) return "Bem Desgastada";
  return "Veterana de Guerra";
};

// Funções para a soma total de valores
export const getTotalLocalInventoryValue = (skins: Array<{ purchasePrice?: number }>): number => {
  return skins.reduce((total, skin) => total + (skin.purchasePrice || 0), 0);
};

export const getTotalSteamInventoryValue = (skins: Array<{ purchasePrice?: number }>): number => {
  return skins.reduce((total, skin) => total + (skin.purchasePrice || 0), 0);
};

// Função para obter a cor da raridade
export const getRarityColor = (rarityString: string): string => {
  const normalized = rarityString.toLowerCase();
  
  if (normalized.includes("consumer") || normalized.includes("comum")) return "#9EA3B8";
  if (normalized.includes("industrial")) return "#5E98D9";
  if (normalized.includes("mil-spec") || normalized.includes("militar")) return "#4B69CD";
  if (normalized.includes("restricted") || normalized.includes("restrito")) return "#8847FF";
  if (normalized.includes("classified") || normalized.includes("secreto")) return "#D32CE6";
  if (normalized.includes("covert") || normalized.includes("oculto")) return "#EB4B4B";
  if (normalized.includes("extraordinary") || normalized.includes("extraordinário")) return "#CAAB05";
  if (normalized.includes("contraband") || normalized.includes("contrabando")) return "#E4AE39";
  
  return "#9EA3B8"; // Default gray
};
