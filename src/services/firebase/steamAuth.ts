
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithCustomToken,
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { User } from "@/types";

// Cache para evitar múltiplas chamadas
let steamAuthWindow: Window | null = null;

// Função para login com Steam
export const loginWithSteam = async (): Promise<void> => {
  try {
    // Fechar qualquer janela anterior que possa estar aberta
    if (steamAuthWindow && !steamAuthWindow.closed) {
      steamAuthWindow.close();
    }
    
    // URL do servidor de autenticação OpenID da Steam
    const steamLoginUrl = 'https://steamcommunity.com/openid/login';
    
    // Parâmetros necessários para autenticação OpenID
    const realm = encodeURIComponent(window.location.origin);
    const returnTo = encodeURIComponent(`${window.location.origin}/auth/steam/callback`);
    
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnTo,
      'openid.realm': realm,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });
    
    const authUrl = `${steamLoginUrl}?${params.toString()}`;
    
    toast.info("Redirecionando para login da Steam...");
    
    // Abrir nova janela para autenticação Steam
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    steamAuthWindow = window.open(
      authUrl,
      'SteamLogin',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!steamAuthWindow) {
      throw new Error("Popup bloqueado. Por favor, permita popups para este site.");
    }
    
    // Configurar listener para mensagens da janela de autenticação
    const handleSteamAuth = async (event: MessageEvent) => {
      // Verificar origem da mensagem
      if (event.origin !== window.location.origin) return;
      
      // Verificar se é uma mensagem de autenticação Steam
      if (event.data && event.data.type === 'STEAM_AUTH') {
        // Remover o event listener
        window.removeEventListener('message', handleSteamAuth);
        
        const { steamId, customToken } = event.data;
        
        if (!steamId || !customToken) {
          toast.error("Falha ao receber dados de autenticação da Steam");
          return;
        }
        
        // Autenticar no Firebase com o token personalizado
        const auth = getAuth();
        const userCredential = await signInWithCustomToken(auth, customToken);
        
        // Depois da autenticação, buscar e salvar dados do usuário da Steam
        await updateSteamUserProfile(userCredential.user, steamId);
        
        toast.success("Login com Steam realizado com sucesso!");
        
        // Fechar a janela de autenticação
        if (steamAuthWindow && !steamAuthWindow.closed) {
          steamAuthWindow.close();
          steamAuthWindow = null;
        }
      }
    };
    
    window.addEventListener('message', handleSteamAuth);
    
    // Poll para verificar se a janela foi fechada sem completar a autenticação
    const checkWindowClosed = setInterval(() => {
      if (steamAuthWindow && steamAuthWindow.closed) {
        clearInterval(checkWindowClosed);
        window.removeEventListener('message', handleSteamAuth);
        steamAuthWindow = null;
      }
    }, 1000);
    
  } catch (error) {
    console.error("Erro no login com Steam:", error);
    toast.error("Falha ao iniciar login com Steam");
    
    // Fechar a janela em caso de erro
    if (steamAuthWindow && !steamAuthWindow.closed) {
      steamAuthWindow.close();
      steamAuthWindow = null;
    }
  }
};

// Função para atualizar o perfil do usuário com dados da Steam
const updateSteamUserProfile = async (firebaseUser: FirebaseUser, steamId: string): Promise<void> => {
  try {
    // API da Steam para obter dados do perfil
    const steamApiKey = await getSteamApiKey();
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
    );
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar dados da Steam: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.response || !data.response.players || data.response.players.length === 0) {
      throw new Error("API da Steam não retornou dados do jogador");
    }
    
    const playerData = data.response.players[0];
    
    // Atualizar dados no Firestore
    const db = getFirestore();
    await setDoc(doc(db, "users", firebaseUser.uid), {
      uid: firebaseUser.uid,
      steamId: steamId,
      displayName: playerData.personaname || firebaseUser.displayName,
      avatarUrl: playerData.avatarfull || '',
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    
    console.log("Perfil do usuário atualizado com dados da Steam");
  } catch (error) {
    console.error("Erro ao atualizar perfil com dados da Steam:", error);
    toast.error("Falha ao atualizar perfil com dados da Steam");
  }
};

// Função para obter API Key da Steam do Firebase
const getSteamApiKey = async (): Promise<string> => {
  // Este valor deve ser armazenado de forma segura (idealmente em uma função Cloud Function)
  // Por enquanto, usamos uma chave de exemplo
  return '2A3C7842A41375B31B81635F6AEB341D';
};
