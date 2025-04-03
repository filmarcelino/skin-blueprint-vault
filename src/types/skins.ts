
import { SkinApiItem } from "@/types";

// Adiciona segurança de tipo para propriedades que podem não existir
export const getSkinProperty = <T>(
  skin: SkinApiItem, 
  property: keyof SkinApiItem, 
  fallback: T
): T => {
  if (property in skin && skin[property] !== undefined && skin[property] !== null) {
    if (typeof skin[property] === 'object' && skin[property] !== null) {
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
