
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Loader2 } from "lucide-react";
import { SkinApiItem, Skin } from "@/types";
import { addLocalSkin } from "@/services/skins";
import { searchSkins, fetchAllSkins } from "@/services/skins/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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
  const [isSearching, setIsSearching] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pré-carregar skins para melhorar a experiência do usuário
  useEffect(() => {
    const loadSkins = async () => {
      try {
        setIsLoaded(false);
        await fetchAllSkins();
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to preload skins:", error);
        setIsLoaded(true); // Even on error, mark as loaded
      }
    };
    
    loadSkins();
  }, []);

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

  // Função de pesquisa debounced
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }
    
    console.log("Search query changed:", searchQuery);
    
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchSkins(searchQuery);
        console.log(`Search returned ${results.length} results`);
        
        setSearchResults(results);
        setIsDropdownOpen(results.length > 0);
      } catch (error) {
        console.error("Error searching skins:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectSkin = (skin: SkinApiItem) => {
    console.log("Selected skin:", skin);
    setSelectedSkin(skin);
    setSearchQuery(skin.name);
    setIsDropdownOpen(false);
  };

  const calculateExterior = (floatValue: number): string => {
    if (floatValue >= 0 && floatValue < 0.07) return "Nova de Fábrica";
    if (floatValue >= 0.07 && floatValue < 0.15) return "Pouco Usada";
    if (floatValue >= 0.15 && floatValue < 0.38) return "Testada em Campo";
    if (floatValue >= 0.38 && floatValue < 0.45) return "Bem Desgastada";
    if (floatValue >= 0.45 && floatValue <= 1) return "Veterana de Guerra";
    return "Desconhecido";
  };

  const getFloatText = (): string => {
    const floatValue = parseFloat(float);
    if (isNaN(floatValue) || floatValue < 0 || floatValue > 1) return "";
    return calculateExterior(floatValue);
  };

  const handleAddSkin = async () => {
    if (!selectedSkin || !user) {
      toast.error("Por favor, selecione uma skin e certifique-se de estar logado");
      return;
    }

    try {
      const floatValue = float ? parseFloat(float) : undefined;
      
      // Validate float
      if (floatValue !== undefined && (isNaN(floatValue) || floatValue < 0 || floatValue > 1)) {
        toast.error("O valor de float deve estar entre 0 e 1");
        return;
      }

      // Extract standardized weapon and category
      const weaponName = typeof selectedSkin.weapon === 'string' ? 
        selectedSkin.weapon : 
        (selectedSkin.weapon ? selectedSkin.weapon.toString() : "Unknown");
      
      const categoryName = typeof selectedSkin.category === 'string' ? 
        selectedSkin.category : 
        (selectedSkin.category ? selectedSkin.category.toString() : "Unknown");
      
      const rarityName = typeof selectedSkin.rarity === 'string' ? 
        selectedSkin.rarity : 
        (selectedSkin.rarity ? selectedSkin.rarity.toString() : "Common");
        
      const imageUrl = selectedSkin.image || "/placeholder.svg";

      const newSkin = await addLocalSkin(user.id, {
        name: selectedSkin.name,
        weapon: weaponName,
        category: categoryName,
        rarity: rarityName,
        float: floatValue,
        stattrak,
        souvenir,
        imageUrl,
      });

      if (!newSkin) {
        toast.error("Falha ao adicionar skin ao inventário");
        return;
      }

      onSkinAdded(newSkin);
      
      // Reset form
      setSelectedSkin(null);
      setSearchQuery("");
      setFloat("");
      setStattrak(false);
      setSouvenir(false);
      
      toast.success("Skin adicionada ao seu inventário");
    } catch (error) {
      console.error("Failed to add skin:", error);
      toast.error("Falha ao adicionar skin");
    }
  };

  const getRarityColor = (skin: SkinApiItem): string => {
    if ('rarityColor' in skin && skin.rarityColor) return skin.rarityColor;
    
    // Fallback colors based on standard rarity names
    if (!skin.rarity) return "#9EA3B8"; // Default gray
    
    const rarityName = typeof skin.rarity === 'string' ? 
      skin.rarity.toLowerCase() : 
      (skin.rarity ? skin.rarity.toString().toLowerCase() : "");
      
    if (rarityName.includes("consumer") || rarityName.includes("comum")) return "#9EA3B8"; // Gray
    if (rarityName.includes("industrial") || rarityName.includes("industrial")) return "#5E98D9"; // Light blue
    if (rarityName.includes("mil-spec") || rarityName.includes("militar")) return "#4B69CD"; // Blue
    if (rarityName.includes("restricted") || rarityName.includes("restrito")) return "#8847FF"; // Purple
    if (rarityName.includes("classified") || rarityName.includes("secreto")) return "#D32CE6"; // Pink
    if (rarityName.includes("covert") || rarityName.includes("oculto")) return "#EB4B4B"; // Red
    if (rarityName.includes("extraordinary") || rarityName.includes("extraordinário")) return "#CAAB05"; // Gold
    if (rarityName.includes("contraband") || rarityName.includes("contrabando")) return "#E4AE39"; // Yellow
    
    return "#9EA3B8"; // Default gray
  };

  return (
    <div className="blueprint-card w-full">
      <h2 className="text-lg font-bold mb-4 glow-text">Adicionar Nova Skin</h2>
      
      <div className="space-y-4">
        <div className="relative" ref={dropdownRef}>
          <Label htmlFor="skinSearch" className="text-sm text-muted-foreground mb-1.5 block">
            Pesquisar Skin
          </Label>
          <div className="relative">
            {isSearching ? (
              <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            )}
            <Input
              id="skinSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquise por arma ou nome da skin..."
              className="pl-9 blueprint-input"
              disabled={!isLoaded}
            />
          </div>
          
          {!isLoaded && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Carregando banco de dados de skins...
              </p>
            </div>
          )}
          
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-card border border-primary/30 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((skin) => (
                  <div
                    key={skin.id}
                    className="p-2 hover:bg-primary/10 cursor-pointer flex items-center gap-2"
                    onClick={() => handleSelectSkin(skin)}
                  >
                    <div 
                      className="w-10 h-10 bg-black/20 rounded flex-shrink-0 border-2" 
                      style={{ borderColor: getRarityColor(skin) }}
                    >
                      <img
                        src={skin.image || '/placeholder.svg'}
                        alt={skin.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{skin.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {typeof skin.weapon === 'string' ? 
                          skin.weapon : 
                          (skin.weapon ? skin.weapon.toString() : 'Desconhecida')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Nenhum resultado encontrado
                </div>
              )}
            </div>
          )}
        </div>

        {selectedSkin && (
          <>
            <div className="flex items-start gap-4">
              <div 
                className="w-24 h-24 bg-black/20 rounded flex-shrink-0 border-2" 
                style={{ borderColor: getRarityColor(selectedSkin) }}
              >
                <img
                  src={selectedSkin.image || '/placeholder.svg'}
                  alt={selectedSkin.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium">{selectedSkin.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {typeof skin.weapon === 'string' ? 
                    skin.weapon : 
                    (skin.weapon ? skin.weapon.toString() : 'Desconhecida')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {typeof skin.category === 'string' ? 
                    skin.category : 
                    (skin.category ? skin.category.toString() : 'Categoria Desconhecida')}
                </p>
                <div 
                  className="inline-block px-2 py-0.5 rounded text-xs mt-1"
                  style={{ 
                    backgroundColor: getRarityColor(selectedSkin) + '33', 
                    color: getRarityColor(selectedSkin) 
                  }}
                >
                  {typeof skin.rarity === 'string' ? 
                    skin.rarity : 
                    (skin.rarity ? skin.rarity.toString() : 'Comum')}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="float" className="text-sm text-muted-foreground block">
                  Valor Float (0-1)
                </Label>
                <div className="space-y-1">
                  <Input
                    id="float"
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    value={float}
                    onChange={(e) => setFloat(e.target.value)}
                    placeholder="Ex: 0.1543"
                    className="blueprint-input"
                  />
                  {float && (
                    <div className="text-xs text-muted-foreground">
                      Exterior: <span className="font-medium">{getFloatText()}</span>
                    </div>
                  )}
                </div>
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
                <Plus className="mr-2 h-4 w-4" /> Adicionar ao Inventário
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddSkinForm;

