
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchSteamInventory, getLocalSkins, removeLocalSkin } from "@/services/skins";
import { Skin } from "@/types";
import Header from "@/components/Header";
import InventoryTabs from "@/components/InventoryTabs";
import ApiKeysManager from "@/components/admin/ApiKeysManager";
import { toast } from "sonner";
import { getTotalLocalInventoryValue, getTotalSteamInventoryValue } from "@/types/skins";

const Dashboard = () => {
  const { user } = useAuth();
  const [localSkins, setLocalSkins] = useState<Skin[]>([]);
  const [steamSkins, setSteamSkins] = useState<Skin[]>([]);
  const [isLoadingSteam, setIsLoadingSteam] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [totalLocalValue, setTotalLocalValue] = useState(0);
  const [totalSteamValue, setTotalSteamValue] = useState(0);

  useEffect(() => {
    if (user) {
      loadLocalSkins();
      
      // If user has Steam ID, load Steam inventory
      if (user.steamId) {
        loadSteamInventory();
      }

      // Show admin panel based on email
      setShowAdmin(user.email === "admin@skinculator.com" || localStorage.getItem("is_admin") === "true");
    }
  }, [user]);
  
  // Calculate totals when inventory changes
  useEffect(() => {
    setTotalLocalValue(getTotalLocalInventoryValue(localSkins));
  }, [localSkins]);
  
  useEffect(() => {
    setTotalSteamValue(getTotalSteamInventoryValue(steamSkins));
  }, [steamSkins]);

  const loadLocalSkins = async () => {
    if (!user) return;
    try {
      const skins = await getLocalSkins(user.id);
      setLocalSkins(skins);
    } catch (error) {
      console.error("Error loading local skins:", error);
    }
  };

  const loadSteamInventory = async () => {
    if (!user || !user.steamId) return;
    
    setIsLoadingSteam(true);
    try {
      const skins = await fetchSteamInventory(user.steamId);
      setSteamSkins(skins);
    } catch (error) {
      console.error("Error loading Steam inventory:", error);
      toast.error("Failed to load Steam inventory");
    } finally {
      setIsLoadingSteam(false);
    }
  };

  const handleDeleteLocalSkin = async (skinId: string) => {
    if (!user) return;
    
    try {
      const success = await removeLocalSkin(user.id, skinId);
      if (success) {
        setLocalSkins(prevSkins => prevSkins.filter(skin => skin.id !== skinId));
        toast.success("Skin removida com sucesso");
      }
    } catch (error) {
      console.error("Error deleting skin:", error);
      toast.error("Falha ao remover skin");
    }
  };

  const handleAddLocalSkin = (skin: Skin) => {
    setLocalSkins(prevSkins => [skin, ...prevSkins]);
    toast.success("Skin adicionada ao inventário");
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="blueprint-container">
          {showAdmin && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-6 px-2">Admin Panel</h1>
              <ApiKeysManager />
            </div>
          )}
          
          <div className="flex flex-wrap justify-between items-center mb-6 px-2">
            <h1 className="text-2xl font-bold">Seu Inventário</h1>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2 sm:mt-0">
              <div className="blueprint-card p-3 flex flex-col items-center">
                <span className="text-sm text-muted-foreground">Inventário Local</span>
                <span className="text-lg font-semibold text-secondary">{formatCurrency(totalLocalValue)}</span>
              </div>
              
              <div className="blueprint-card p-3 flex flex-col items-center">
                <span className="text-sm text-muted-foreground">Inventário Steam</span>
                <span className="text-lg font-semibold text-secondary">{formatCurrency(totalSteamValue)}</span>
              </div>
              
              <div className="blueprint-card p-3 flex flex-col items-center">
                <span className="text-sm text-muted-foreground">Valor Total</span>
                <span className="text-lg font-semibold text-primary">{formatCurrency(totalLocalValue + totalSteamValue)}</span>
              </div>
            </div>
          </div>
          
          <InventoryTabs 
            localSkins={localSkins}
            steamSkins={steamSkins}
            onRefreshSteamInventory={loadSteamInventory}
            onDeleteLocalSkin={handleDeleteLocalSkin}
            onAddLocalSkin={handleAddLocalSkin}
            isLoadingSteam={isLoadingSteam}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
