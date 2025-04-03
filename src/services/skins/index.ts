
// Re-export everything from the individual files to maintain current imports
export * from './api';
export * from './apiConfig';
export * from './skinsFetcher';
export * from './skinsSearch';
export * from './inventory';
export * from './utils';

// Initialize API configuration when this file is imported
import { initApiConfig } from './apiConfig';

// Call this function when the app starts
initApiConfig();
