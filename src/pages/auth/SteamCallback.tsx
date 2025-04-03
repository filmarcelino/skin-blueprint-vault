
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SteamCallback = () => {
  const [status, setStatus] = useState('Processando login com Steam...');
  const navigate = useNavigate();
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        setStatus('Verificando dados de autenticação...');
        
        // Obter os parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        
        // Verificar se temos o parâmetro de identidade da OpenID
        const identity = urlParams.get('openid.identity');
        
        if (!identity) {
          setStatus('Falha: Dados de autenticação ausentes');
          toast.error('Falha no processo de autenticação da Steam');
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // Extrair steamID64 da URL de identidade (formato: https://steamcommunity.com/openid/id/76561198XXXXXXXXX)
        const steamId = identity.split('/').pop();
        
        if (!steamId) {
          setStatus('Falha: Steam ID não encontrado');
          toast.error('Steam ID não encontrado na resposta de autenticação');
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        setStatus('Validando autenticação...');
        
        // Em uma aplicação real, aqui faria uma chamada para sua API/Cloud Function
        // que verificaria a autenticação OpenID com a Steam e geraria um token personalizado
        // do Firebase Authentication
        
        // Como estamos em modo de demonstração, simulamos a recepção de um token
        const demoCustomToken = "demo_custom_token";
        
        setStatus('Autenticando no Firebase...');
        
        // Enviar mensagem à janela pai
        window.opener.postMessage({
          type: 'STEAM_AUTH',
          steamId,
          customToken: demoCustomToken
        }, window.location.origin);
        
        // Fechar esta janela após enviar a mensagem
        window.close();
        
      } catch (error) {
        console.error("Erro no callback do Steam:", error);
        setStatus('Erro no processamento da autenticação');
        toast.error('Falha ao processar autenticação da Steam');
        setTimeout(() => navigate('/'), 3000);
      }
    };
    
    processCallback();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="animate-pulse text-primary text-xl font-bold mb-4">
        Steam Login
      </div>
      <div className="text-center">
        <p className="text-lg">{status}</p>
        <p className="text-sm text-muted-foreground mt-4">
          Esta janela fechará automaticamente.
        </p>
      </div>
    </div>
  );
};

export default SteamCallback;
