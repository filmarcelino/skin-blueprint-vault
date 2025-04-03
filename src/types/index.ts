
export interface User {
  id: string;
  email: string;
  steamId?: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Skin {
  id: string;
  name: string;
  weapon: string;
  category: string;
  rarity: string;
  float?: number;
  exterior?: string;
  stattrak: boolean;
  souvenir: boolean;
  imageUrl: string;
  source: 'steam' | 'local';
  userId: string;
  // New fields
  purchasePrice?: number;
  purchaseDate?: string;
  purchaseLocation?: string;
  expectedSalePrice?: number;
  tradeLock?: boolean;
  tradeLockEndDate?: string;
  comments?: string;
}

export interface SkinApiItem {
  id: string;
  name: string;
  description?: string;
  weapon?: string | object;
  category?: string | object;
  pattern?: string | object;
  min_float?: number;
  max_float?: number;
  rarity?: string | { name: string; color?: string };
  image?: string;
  [key: string]: any; // Allow additional properties that might come from the API
}

export type Exterior = 
  | "Nova de Fábrica" 
  | "Pouco Usada" 
  | "Testada em Campo" 
  | "Bem Desgastada" 
  | "Veterana de Guerra";

export interface SkinsManager {
  downloadAll: () => Promise<boolean>;
  getStatus: () => Promise<DownloadStatus>;
}

export interface DownloadStatus {
  totalSkins: number;
  downloadedSkins: number;
  lastUpdated: string;
  isDownloading: boolean;
  error?: string;
}
