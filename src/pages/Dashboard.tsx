
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getLocalSkins, fetchSteamInventory, removeLocalSkin } from "@/services/skins";
import { Skin } from "@/types";
import Header from "@/components/Header";
import InventoryTabs from "@/components/InventoryTabs";

const Dashboard = () => {
  const { user } = useAuth();
  const [localSkins, setLocalSkins] = useState<Skin[]>([]);
  const [steamSkins, setSteamSkins] = useState<Skin[]>([]);
  const [isLoadingSteam, setIsLoadingSteam] = useState(false);

  useEffect(() => {
    if (user) {
      loadLocalSkins();
      
      // If user has Steam ID, load Steam inventory
      if (user.steamId) {
        loadSteamInventory();
      }
    }
  }, [user]);

  const loadLocalSkins = () => {
    if (!user) return;
    const skins = getLocalSkins(user.id);
    setLocalSkins(skins);
  };

  const loadSteamInventory = async () => {
    if (!user || !user.steamId) return;
    
    setIsLoadingSteam(true);
    try {
      const skins = await fetchSteamInventory(user.steamId);
      setSteamSkins(skins);
    } finally {
      setIsLoadingSteam(false);
    }
  };

  const handleDeleteLocalSkin = (skinId: string) => {
    if (!user) return;
    
    removeLocalSkin(user.id, skinId);
    setLocalSkins(prevSkins => prevSkins.filter(skin => skin.id !== skinId));
  };

  const handleAddLocalSkin = (skin: Skin) => {
    setLocalSkins(prevSkins => [skin, ...prevSkins]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="blueprint-container">
          <h1 className="text-2xl font-bold mb-6 px-2">Your Inventory</h1>
          
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
