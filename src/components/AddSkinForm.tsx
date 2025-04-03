
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus } from "lucide-react";
import { SkinApiItem, Skin } from "@/types";
import { addLocalSkin, fetchAllSkins } from "@/services/skins";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface AddSkinFormProps {
  onSkinAdded: (skin: Skin) => void;
}

const AddSkinForm = ({ onSkinAdded }: AddSkinFormProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkin, setSelectedSkin] = useState<SkinApiItem | null>(null);
  const [float, setFloat] = useState<string>("");
  const [stattrak, setStattrak] = useState(false);
  const [souvenir, setSouvenir] = useState(false);
  const [searchResults, setSearchResults] = useState<SkinApiItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: allSkins = [] } = useQuery({
    queryKey: ['skins'],
    queryFn: fetchAllSkins,
  });

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const results = allSkins
        .filter(skin => 
          skin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (skin.weapon && skin.weapon.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5);
      setSearchResults(results);
      setIsDropdownOpen(results.length > 0);
    } else {
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery, allSkins]);

  const handleSelectSkin = (skin: SkinApiItem) => {
    setSelectedSkin(skin);
    setSearchQuery(skin.name);
    setIsDropdownOpen(false);
  };

  const handleAddSkin = () => {
    if (!selectedSkin || !user) return;

    try {
      const floatValue = float ? parseFloat(float) : undefined;
      
      // Validate float
      if (floatValue !== undefined && (isNaN(floatValue) || floatValue < 0 || floatValue > 1)) {
        toast.error("Float value must be between 0 and 1");
        return;
      }

      const newSkin = addLocalSkin(user.id, {
        name: selectedSkin.name,
        weapon: selectedSkin.weapon || "",
        category: selectedSkin.category || "",
        rarity: selectedSkin.rarity || "Common",
        float: floatValue,
        stattrak,
        souvenir,
        imageUrl: selectedSkin.image || "",
      });

      onSkinAdded(newSkin);
      
      // Reset form
      setSelectedSkin(null);
      setSearchQuery("");
      setFloat("");
      setStattrak(false);
      setSouvenir(false);
      
      toast.success("Skin added to your inventory");
    } catch (error) {
      console.error("Failed to add skin:", error);
      toast.error("Failed to add skin");
    }
  };

  return (
    <div className="blueprint-card w-full">
      <h2 className="text-lg font-bold mb-4 glow-text">Add New Skin</h2>
      
      <div className="space-y-4">
        <div className="relative" ref={dropdownRef}>
          <Label htmlFor="skinSearch" className="text-sm text-muted-foreground mb-1.5 block">
            Search Skin
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="skinSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by weapon or skin name..."
              className="pl-9 blueprint-input"
            />
          </div>
          
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-card border border-primary/30 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((skin) => (
                <div
                  key={skin.id}
                  className="p-2 hover:bg-primary/10 cursor-pointer flex items-center gap-2"
                  onClick={() => handleSelectSkin(skin)}
                >
                  {skin.image && (
                    <div className="w-8 h-8 bg-black/20 rounded flex-shrink-0">
                      <img
                        src={skin.image}
                        alt={skin.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">{skin.name}</div>
                    {skin.weapon && (
                      <div className="text-xs text-muted-foreground">{skin.weapon}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedSkin && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="float" className="text-sm text-muted-foreground mb-1.5 block">
                  Float Value (0-1)
                </Label>
                <Input
                  id="float"
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  value={float}
                  onChange={(e) => setFloat(e.target.value)}
                  placeholder="e.g. 0.1543"
                  className="blueprint-input"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stattrak"
                    checked={stattrak}
                    onCheckedChange={(checked) => setStattrak(checked === true)}
                  />
                  <Label htmlFor="stattrak" className="text-sm">
                    StatTrak™
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="souvenir"
                    checked={souvenir}
                    onCheckedChange={(checked) => setSouvenir(checked === true)}
                  />
                  <Label htmlFor="souvenir" className="text-sm">
                    Souvenir
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <Button onClick={handleAddSkin} className="w-full" disabled={!selectedSkin}>
                <Plus className="mr-2 h-4 w-4" /> Add to Inventory
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddSkinForm;
