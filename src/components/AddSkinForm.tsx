
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
import { Skeleton } from "@/components/ui/skeleton";

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

  const { 
    data: allSkins = [], 
    isLoading,
    error 
  } = useQuery({
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
    console.log("Search query changed:", searchQuery);
    console.log("All skins loaded:", allSkins.length);

    if (searchQuery.length > 2 && allSkins.length > 0) {
      try {
        const results = allSkins
          .filter(skin => {
            try {
              // Safely check if skin.name exists and is a string
              const nameMatch = skin.name && typeof skin.name === 'string' 
                ? skin.name.toLowerCase().includes(searchQuery.toLowerCase()) 
                : false;
                
              // Safely check if skin.weapon exists and is a string
              const weaponMatch = skin.weapon && typeof skin.weapon === 'string' 
                ? skin.weapon.toLowerCase().includes(searchQuery.toLowerCase()) 
                : false;
                
              return nameMatch || weaponMatch;
            } catch (err) {
              console.error("Error filtering skin:", err, skin);
              return false;
            }
          })
          .slice(0, 5);
          
        console.log("Search results:", results.length);
        setSearchResults(results);
        setIsDropdownOpen(results.length > 0);
      } catch (err) {
        console.error("Error processing search:", err);
        toast.error("Error searching for skins");
        setSearchResults([]);
        setIsDropdownOpen(false);
      }
    } else {
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery, allSkins]);

  const handleSelectSkin = (skin: SkinApiItem) => {
    console.log("Selected skin:", skin);
    setSelectedSkin(skin);
    setSearchQuery(skin.name);
    setIsDropdownOpen(false);
  };

  const handleAddSkin = () => {
    if (!selectedSkin || !user) {
      toast.error("Please select a skin and make sure you're logged in");
      return;
    }

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

      if (!newSkin) {
        toast.error("Failed to add skin to inventory");
        return;
      }

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

  if (error) {
    console.error("Error loading skins:", error);
    return (
      <div className="blueprint-card w-full">
        <h2 className="text-lg font-bold mb-4 text-destructive">Error loading skins</h2>
        <p className="text-sm text-muted-foreground">
          There was a problem loading the skins database. Please try again later.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Reload Page
        </Button>
      </div>
    );
  }

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
              disabled={isLoading}
            />
          </div>
          
          {isLoading && (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
          
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-card border border-primary/30 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((skin) => (
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
                          onError={(e) => {
                            // Replace broken image with placeholder
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium">{skin.name}</div>
                      {skin.weapon && (
                        <div className="text-xs text-muted-foreground">
                          {typeof skin.weapon === 'string' ? skin.weapon : 'Unknown weapon'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              )}
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
