import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchSteamInventory, getLocalSkins, removeLocalSkin } from "@/services/skins";
import { Skin } from "@/types";
import Header from "@/components/Header";
import InventoryTabs from "@/components/InventoryTabs";
import ApiKeysManager from "@/components/admin/ApiKeysManager";
import { isFallbackMode } from "@/services/supabase";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [localSkins, setLocalSkins] = useState<Skin[]>([]);
  const [steamSkins, setSteamSkins] = useState<Skin[]>([]);
  const [isLoadingSteam, setIsLoadingSteam] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      loadLocalSkins();
      
      // If user has Steam ID, load Steam inventory
      if (user.steamId) {
        loadSteamInventory();
      }

      // In fallback mode, show admin panel to anyone for demo purposes
      // Otherwise check if user is admin based on email
      if (isFallbackMode) {
        setShowAdmin(true);
      } else {
        setShowAdmin(user.email === "admin@skinculator.com" || localStorage.getItem("is_admin") === "true");
      }
    }
  }, [user]);

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
        toast.success("Skin removed successfully");
      }
    } catch (error) {
      console.error("Error deleting skin:", error);
      toast.error("Failed to delete skin");
    }
  };

  const handleAddLocalSkin = (skin: Skin) => {
    setLocalSkins(prevSkins => [skin, ...prevSkins]);
    toast.success("Skin added to inventory");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="blueprint-container">
          {isFallbackMode && (
            <div className="mb-6 px-2">
              <p className="text-amber-600 text-sm">
                <strong>Note:</strong> Running in fallback mode. Your data is stored in your browser's local storage and will be lost if you clear your browser data.
              </p>
            </div>
          )}
          
          {showAdmin && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-6 px-2">Admin Panel</h1>
              <ApiKeysManager />
            </div>
          )}
          
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
