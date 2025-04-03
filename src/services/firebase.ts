
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, updateProfile } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { toast } from "sonner";
import { User, Skin } from "@/types";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC123Gj3WXji4Bol1ultIsfRk-0wQyIBpQ",
  authDomain: "skinculator-4d340.firebaseapp.com",
  projectId: "skinculator-4d340",
  storageBucket: "skinculator-4d340.firebasestorage.app",
  messagingSenderId: "851941199673",
  appId: "1:851941199673:web:d25d1180d87368f02c22e8",
  measurementId: "G-Z1DBYYKPRZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Config constants
const STEAM_API_KEY_DEFAULT = '2A3C7842A41375B31B81635F6AEB341D';
const BYMYKEL_API_URL_DEFAULT = 'https://bymykel.github.io/CSGO-API/api/pt-BR/skins.json';

// Auth functions
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  
  if (!firebaseUser) return null;

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
    avatarUrl: firebaseUser.photoURL || "",
    steamId: firebaseUser.providerData.some(p => p.providerId === 'steam.com') 
      ? firebaseUser.uid 
      : undefined
  };
};

export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    toast.success('Logged in successfully');
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
      avatarUrl: firebaseUser.photoURL || "",
      steamId: firebaseUser.providerData.some(p => p.providerId === 'steam.com') ? firebaseUser.uid : undefined
    };
  } catch (error: any) {
    const errorMessage = error.message || "Login failed";
    toast.error(errorMessage);
    return null;
  }
};

export const register = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Set initial display name
    const username = email.split("@")[0];
    await updateProfile(firebaseUser, { displayName: username });
    
    toast.success('Registered successfully');
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: username,
      avatarUrl: "",
      steamId: undefined
    };
  } catch (error: any) {
    const errorMessage = error.message || "Registration failed";
    toast.error(errorMessage);
    return null;
  }
};

export const loginWithSteam = async (): Promise<void> => {
  // For now, we'll use a mock implementation since Steam auth requires server-side setup
  toast.info('Steam login is not yet implemented with Firebase');
  
  // In a real implementation, you would:
  // 1. Create a server endpoint for Steam authentication
  // 2. Redirect the user to Steam login
  // 3. Process the response in your server
  // 4. Use Firebase Custom Auth to create a token
  // 5. Sign in the user with that token
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    toast.success("Logged out successfully");
  } catch (error) {
    console.error("Error in logout:", error);
    toast.error("Logout failed");
  }
};

export const initAuth = async (): Promise<void> => {
  // Set up auth state listener in Firebase
  onAuthStateChanged(auth, (user) => {
    // This is handled by AuthContext
  });
};

// Config functions
export const getConfigValue = async (key: string): Promise<string | null> => {
  try {
    const docRef = doc(db, 'config', key);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().value;
    }
    
    // Return default values if not found
    if (key === 'steam_api_key') return STEAM_API_KEY_DEFAULT;
    if (key === 'bymykel_api_url') return BYMYKEL_API_URL_DEFAULT;
    
    return null;
  } catch (error) {
    console.error(`Error fetching config ${key}:`, error);
    
    // Return default values if fetch fails
    if (key === 'steam_api_key') return STEAM_API_KEY_DEFAULT;
    if (key === 'bymykel_api_url') return BYMYKEL_API_URL_DEFAULT;
    
    return null;
  }
};

export const setConfigValue = async (key: string, value: string): Promise<boolean> => {
  try {
    await setDoc(doc(db, 'config', key), { value }, { merge: true });
    return true;
  } catch (error) {
    console.error(`Error setting config ${key}:`, error);
    toast.error(`Failed to save ${key}`);
    return false;
  }
};

// Helper functions for skin management
export const calculateExteriorFromFloat = (float: number): string => {
  if (float >= 0 && float < 0.07) return "Nova de Fábrica";
  if (float >= 0.07 && float < 0.15) return "Pouco Usada";
  if (float >= 0.15 && float < 0.38) return "Testada em Campo";
  if (float >= 0.38 && float < 0.45) return "Bem Desgastada";
  if (float >= 0.45 && float <= 1) return "Veterana de Guerra";
  return "Desconhecido";
};

// Access keys
export const getSteamApiKey = async (): Promise<string> => {
  return (await getConfigValue('steam_api_key')) || STEAM_API_KEY_DEFAULT;
};

export const getByMykelApiUrl = async (): Promise<string> => {
  return (await getConfigValue('bymykel_api_url')) || BYMYKEL_API_URL_DEFAULT;
};

// Skins database functions
export const addSkinToLocalInventory = async (userId: string, skinData: {
  name: string;
  weapon: string;
  category: string;
  rarity: string;
  float_value: number;
  stattrak: boolean;
  souvenir: boolean;
  image_url: string;
}): Promise<boolean> => {
  try {
    const exterior = calculateExteriorFromFloat(skinData.float_value);
    
    await addDoc(collection(db, 'local_inventory'), {
      userId,
      ...skinData,
      exterior,
      source: "local",
      created_at: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error adding skin to local inventory:', error);
    return false;
  }
};

export const getUserLocalInventory = async (userId: string): Promise<any[]> => {
  try {
    const q = query(collection(db, 'local_inventory'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const skins: any[] = [];
    querySnapshot.forEach((doc) => {
      skins.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return skins.sort((a, b) => {
      // Sort by created_at desc
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  } catch (error) {
    console.error('Error getting user local inventory:', error);
    return [];
  }
};

export const deleteSkinFromLocalInventory = async (skinId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'local_inventory', skinId));
    return true;
  } catch (error) {
    console.error('Error deleting skin from local inventory:', error);
    return false;
  }
};

export const saveSkinData = async (skins: any[]): Promise<boolean> => {
  try {
    // Use batched writes for better performance
    const batch = 500; // Firestore allows max 500 operations per batch
    
    for (let i = 0; i < skins.length; i += batch) {
      const chunk = skins.slice(i, i + batch);
      
      // Process each chunk
      for (const skin of chunk) {
        await setDoc(doc(db, 'skins_database', skin.id), {
          id: skin.id,
          name: skin.name,
          description: skin.description,
          weapon: skin.weapon,
          category: skin.category,
          pattern: skin.pattern,
          min_float: skin.min_float,
          max_float: skin.max_float,
          rarity: skin.rarity,
          image: skin.image
        }, { merge: true });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving skin data:', error);
    return false;
  }
};

export const getSkinDatabase = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'skins_database'));
    const skins: any[] = [];
    
    querySnapshot.forEach((doc) => {
      skins.push(doc.data());
    });
    
    return skins;
  } catch (error) {
    console.error('Error getting skin database:', error);
    return [];
  }
};

// Initialize the config
export const initializeConfigTable = async (): Promise<void> => {
  try {
    // Check if Steam API key exists
    const steamApiKey = await getConfigValue('steam_api_key');
    if (!steamApiKey) {
      await setConfigValue('steam_api_key', STEAM_API_KEY_DEFAULT);
    }
    
    // Check if ByMykel API URL exists
    const bymykelApiUrl = await getConfigValue('bymykel_api_url');
    if (!bymykelApiUrl) {
      await setConfigValue('bymykel_api_url', BYMYKEL_API_URL_DEFAULT);
    }
  } catch (error) {
    console.error('Error initializing config table:', error);
  }
};

// Initialize config when module is imported
initializeConfigTable().catch(console.error);
