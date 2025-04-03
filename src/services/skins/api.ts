
// Export all functionality from the refactored files
export { initApiConfig } from './apiConfig';
export { downloadSkinsData } from './skinsFetcher';
export { fetchAllSkins } from './skinsFetcher';
export { findSkinByName, searchSkins } from './skinsSearch';

// Iniciar o carregamento de skins logo na inicialização para garantir disponibilidade
import { fetchAllSkins } from './skinsFetcher';

(async () => {
  try {
    await fetchAllSkins();
  } catch (error) {
    console.error("Failed to preload skins:", error);
  }
})();
