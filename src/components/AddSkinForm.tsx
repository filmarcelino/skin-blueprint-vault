import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Loader2, Calendar } from "lucide-react";
import { SkinApiItem, Skin } from "@/types";
import { addLocalSkin } from "@/services/skins";
import { searchSkins, fetchAllSkins } from "@/services/skins/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSkinProperty, getSkinName, getSkinWeapon, getSkinCategory, getSkinRarity, getSkinImage } from "@/types/skins";

interface AddSkinFormProps {
  onSkinAdded: (skin: Skin) => void;
}

const AddSkinForm = ({ onSkinAdded }: AddSkinFormProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
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
  const formRef = useRef<HTMLDivElement>(null);
  
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined);
  const [purchaseLocation, setPurchaseLocation] = useState<string>("");
  const [expectedSalePrice, setExpectedSalePrice] = useState<string>("");
  const [tradeLock, setTradeLock] = useState(false);
  const [tradeLockEndDate, setTradeLockEndDate] = useState<Date | undefined>(undefined);
  const [comments, setComments] = useState<string>("");

  useEffect(() => {
    const loadSkins = async () => {
      try {
        setIsLoaded(false);
        await fetchAllSkins();
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to preload skins:", error);
        setIsLoaded(true);
      }
    };
    
    loadSkins();
  }, []);

  useEffect(() => {
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
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectSkin = (skin: SkinApiItem) => {
    console.log("Selected skin:", skin);
    setSelectedSkin(skin);
    setSearchQuery(getSkinName(skin));
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
      
      if (floatValue !== undefined && (isNaN(floatValue) || floatValue < 0 || floatValue > 1)) {
        toast.error("O valor de float deve estar entre 0 e 1");
        return;
      }

      const skinName = getSkinName(selectedSkin);
      const weaponName = getSkinWeapon(selectedSkin);
      const categoryName = getSkinCategory(selectedSkin);
      const rarityName = getSkinRarity(selectedSkin);
      const imageUrl = getSkinImage(selectedSkin);

      const purchasePriceValue = purchasePrice ? parseFloat(purchasePrice) : undefined;
      const expectedSalePriceValue = expectedSalePrice ? parseFloat(expectedSalePrice) : undefined;

      const newSkin = await addLocalSkin(user.id, {
        name: skinName,
        weapon: weaponName,
        category: categoryName,
        rarity: rarityName,
        float: floatValue,
        stattrak,
        souvenir,
        imageUrl,
        purchasePrice: purchasePriceValue,
        purchaseDate: purchaseDate ? purchaseDate.toISOString() : undefined,
        purchaseLocation,
        expectedSalePrice: expectedSalePriceValue,
        tradeLock,
        tradeLockEndDate: tradeLockEndDate ? tradeLockEndDate.toISOString() : undefined,
        comments
      });

      if (!newSkin) {
        toast.error("Falha ao adicionar skin ao inventário");
        return;
      }

      onSkinAdded(newSkin);
      
      setSelectedSkin(null);
      setSearchQuery("");
      setFloat("");
      setStattrak(false);
      setSouvenir(false);
      setPurchasePrice("");
      setPurchaseDate(undefined);
      setPurchaseLocation("");
      setExpectedSalePrice("");
      setTradeLock(false);
      setTradeLockEndDate(undefined);
      setComments("");
      
      toast.success("Skin adicionada ao seu inventário");
    } catch (error) {
      console.error("Failed to add skin:", error);
      toast.error("Falha ao adicionar skin");
    }
  };

  const formatSkinProperty = (prop: any): string => {
    if (prop === null || prop === undefined) return "Desconhecido";
    if (typeof prop === 'string') return prop;
    if (typeof prop === 'number') return String(prop);
    if (typeof prop === 'object') {
      if ('name' in prop && prop.name) return prop.name;
      try {
        return JSON.stringify(prop);
      } catch {
        return "Objeto complexo";
      }
    }
    return String(prop);
  };

  const getRarityColor = (skin: SkinApiItem): string => {
    if ('rarityColor' in skin && skin.rarityColor) return String(skin.rarityColor);
    
    if (!skin.rarity) return "#9EA3B8";
    
    const rarityString = formatSkinProperty(skin.rarity).toLowerCase();
      
    if (rarityString.includes("consumer") || rarityString.includes("comum")) return "#9EA3B8";
    if (rarityString.includes("industrial") || rarityString.includes("industrial")) return "#5E98D9";
    if (rarityString.includes("mil-spec") || rarityString.includes("militar")) return "#4B69CD";
    if (rarityString.includes("restricted") || rarityString.includes("restrito")) return "#8847FF";
    if (rarityString.includes("classified") || rarityString.includes("secreto")) return "#D32CE6";
    if (rarityString.includes("covert") || rarityString.includes("oculto")) return "#EB4B4B";
    if (rarityString.includes("extraordinary") || rarityString.includes("extraordinário")) return "#CAAB05";
    if (rarityString.includes("contraband") || rarityString.includes("contrabando")) return "#E4AE39";
    
    return "#9EA3B8";
  };

  return (
    <div className="blueprint-card w-full" ref={formRef}>
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
            <div className="absolute z-[9999] top-full left-0 mt-1 bg-card border border-primary/30 rounded-md shadow-lg overflow-y-auto w-full" style={{
              maxHeight: '300px',
              position: 'absolute'
            }}>
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 hover:bg-primary/10 cursor-pointer flex items-center gap-2"
                    onClick={() => handleSelectSkin(item)}
                  >
                    <div 
                      className="w-10 h-10 bg-black/20 rounded flex-shrink-0 border-2" 
                      style={{ borderColor: getRarityColor(item) }}
                    >
                      <img
                        src={getSkinImage(item)}
                        alt={getSkinName(item)}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{getSkinName(item)}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {formatSkinProperty(item.weapon)}
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
                  src={getSkinImage(selectedSkin)}
                  alt={getSkinName(selectedSkin)}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium">{getSkinName(selectedSkin)}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatSkinProperty(selectedSkin.weapon)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatSkinProperty(selectedSkin.category)}
                </p>
                <div 
                  className="inline-block px-2 py-0.5 rounded text-xs mt-1"
                  style={{ 
                    backgroundColor: getRarityColor(selectedSkin) + '33', 
                    color: getRarityColor(selectedSkin) 
                  }}
                >
                  {formatSkinProperty(selectedSkin.rarity)}
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="advanced">Informações de Negociação</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="pt-4">
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
              </TabsContent>
              
              <TabsContent value="advanced" className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice" className="text-sm text-muted-foreground block">
                      Preço de Compra (R$)
                    </Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="R$ 0,00"
                      className="blueprint-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground block">
                      Data de Compra
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {purchaseDate ? format(purchaseDate, 'dd/MM/yyyy') : <span>Selecionar data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={purchaseDate}
                          onSelect={setPurchaseDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purchaseLocation" className="text-sm text-muted-foreground block">
                    Local de Compra
                  </Label>
                  <Input
                    id="purchaseLocation"
                    value={purchaseLocation}
                    onChange={(e) => setPurchaseLocation(e.target.value)}
                    placeholder="Steam Market, Skinport, etc."
                    className="blueprint-input"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedSalePrice" className="text-sm text-muted-foreground block">
                      Preço Esperado de Venda (R$)
                    </Label>
                    <Input
                      id="expectedSalePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={expectedSalePrice}
                      onChange={(e) => setExpectedSalePrice(e.target.value)}
                      placeholder="R$ 0,00"
                      className="blueprint-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="tradeLock"
                        checked={tradeLock}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          setTradeLock(isChecked);
                          if (!isChecked) setTradeLockEndDate(undefined);
                        }}
                      />
                      <Label htmlFor="tradeLock" className="text-sm">
                        Trade Lock
                      </Label>
                    </div>
                    
                    {tradeLock && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {tradeLockEndDate ? format(tradeLockEndDate, 'dd/MM/yyyy') : <span>Data fim do trade lock</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" style={{ zIndex: 10000 }}>
                          <CalendarComponent
                            mode="single"
                            selected={tradeLockEndDate}
                            onSelect={setTradeLockEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comments" className="text-sm text-muted-foreground block">
                    Observações
                  </Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Informações adicionais sobre a skin..."
                    className="min-h-[80px]"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
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
