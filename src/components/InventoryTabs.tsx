
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { Skin } from "@/types";
import { exportInventoryToJson, fetchSteamInventory, removeLocalSkin } from "@/services/skins";
import { useAuth } from "@/context/AuthContext";
import SkinCard from "./SkinCard";
import { toast } from "sonner";
import AddSkinForm from "./AddSkinForm";

interface InventoryTabsProps {
  localSkins: Skin[];
  steamSkins: Skin[];
  onRefreshSteamInventory: () => void;
  onDeleteLocalSkin: (skinId: string) => void;
  onAddLocalSkin: (skin: Skin) => void;
  isLoadingSteam: boolean;
}

const InventoryTabs = ({
  localSkins,
  steamSkins,
  onRefreshSteamInventory,
  onDeleteLocalSkin,
  onAddLocalSkin,
  isLoadingSteam
}: InventoryTabsProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("local");

  const handleExport = () => {
    if (!user) return;
    exportInventoryToJson(user.id);
    toast.success("Inventory exported successfully");
  };

  return (
    <Tabs
      defaultValue="local"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <TabsList>
          <TabsTrigger value="local" className="px-6">
            Local Inventory
            {localSkins.length > 0 && (
              <span className="ml-2 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                {localSkins.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="steam" className="px-6">
            Steam Inventory
            {steamSkins.length > 0 && (
              <span className="ml-2 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                {steamSkins.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex gap-2">
          {activeTab === "local" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={localSkins.length === 0}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          )}
          {activeTab === "steam" && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshSteamInventory}
              disabled={isLoadingSteam}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingSteam ? "animate-spin" : ""}`} /> Refresh
            </Button>
          )}
        </div>
      </div>

      <TabsContent value="local" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AddSkinForm onSkinAdded={onAddLocalSkin} />
          
          {localSkins.map((skin) => (
            <SkinCard
              key={skin.id}
              skin={skin}
              onDelete={() => onDeleteLocalSkin(skin.id)}
            />
          ))}
        </div>
        
        {localSkins.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Your local inventory is empty. Add some skins!
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="steam">
        {user?.steamId ? (
          <>
            {isLoadingSteam ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Steam inventory...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {steamSkins.map((skin) => (
                  <SkinCard key={skin.id} skin={skin} />
                ))}
                {steamSkins.length === 0 && (
                  <div className="text-center py-8 col-span-full">
                    <p className="text-muted-foreground">
                      No skins found in your Steam inventory.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Link your Steam account to view your CS2 inventory.
            </p>
            <Button className="mt-4" variant="outline">
              Connect Steam
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default InventoryTabs;
