
import { Skin } from "@/types";
import { calculateExterior } from "@/services/skins";
import { Trash2, Info } from "lucide-react";
import { Button } from "./ui/button";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SkinCardProps {
  skin: Skin;
  onDelete?: () => void;
}

const getRarityClass = (rarity?: string) => {
  if (!rarity) return "";
  
  const rarityLower = rarity.toLowerCase();
  if (rarityLower.includes("consumer")) return "rarity-consumer";
  if (rarityLower.includes("industrial")) return "rarity-industrial";
  if (rarityLower.includes("mil-spec")) return "rarity-mil-spec";
  if (rarityLower.includes("restricted")) return "rarity-restricted";
  if (rarityLower.includes("classified")) return "rarity-classified";
  if (rarityLower.includes("covert")) return "rarity-covert";
  if (rarityLower.includes("contraband")) return "rarity-contraband";
  
  return "";
};

const formatCurrency = (value?: number): string => {
  if (value === undefined) return "N/A";
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const SkinCard = ({ skin, onDelete }: SkinCardProps) => {
  const rarityClass = getRarityClass(skin.rarity);
  
  const hasTradeInfo = skin.purchasePrice || 
    skin.purchaseDate ||
    skin.purchaseLocation || 
    skin.expectedSalePrice || 
    skin.tradeLock || 
    skin.comments;

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      console.error("Invalid date format:", e);
      return "Data inválida";
    }
  };

  const getProfitInfo = (): { profit?: number, percentage?: number, color: string } => {
    if (skin.purchasePrice === undefined || skin.expectedSalePrice === undefined) {
      return { color: "text-muted-foreground" };
    }
    
    const profit = skin.expectedSalePrice - skin.purchasePrice;
    const percentage = skin.purchasePrice > 0 ? (profit / skin.purchasePrice) * 100 : 0;
    
    let color = "text-muted-foreground";
    if (profit > 0) color = "text-emerald-500";
    if (profit < 0) color = "text-red-500";
    
    return { profit, percentage, color };
  };
  
  const profitInfo = getProfitInfo();
  
  return (
    <div className={`blueprint-card animate-fade-in ${rarityClass}`}>
      <div className="blueprint-lines">
        <div className="flex flex-col h-full">
          <div className="relative pb-[56.25%] mb-3 bg-black/20 overflow-hidden rounded">
            <img 
              src={skin.imageUrl} 
              alt={skin.name} 
              className="absolute inset-0 w-full h-full object-contain p-2"
            />
            {skin.stattrak && (
              <div className="absolute top-2 left-2 bg-yellow-600/80 text-white text-xs px-1.5 py-0.5 rounded">
                StatTrak™
              </div>
            )}
            {skin.souvenir && (
              <div className="absolute top-2 right-2 bg-yellow-500/80 text-white text-xs px-1.5 py-0.5 rounded">
                Souvenir
              </div>
            )}
            {skin.tradeLock && (
              <div className="absolute bottom-2 left-2 bg-red-500/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                <span className="mr-1">🔒</span> 
                <span>
                  {skin.tradeLockEndDate ? formatDate(skin.tradeLockEndDate) : "Trade Lock"}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-start gap-2">
              <h3 className={`text-sm font-bold truncate ${rarityClass}`}>
                {skin.name}
              </h3>
              <div className="flex gap-1">
                {hasTradeInfo && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                        >
                          <Info className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[280px] p-4 space-y-2">
                        <h4 className="font-semibold text-sm">Informações de Negociação</h4>
                        
                        {skin.purchasePrice !== undefined && (
                          <div className="grid grid-cols-2 text-xs gap-1">
                            <span className="text-muted-foreground">Preço de Compra:</span>
                            <span>{formatCurrency(skin.purchasePrice)}</span>
                          </div>
                        )}
                        
                        {skin.expectedSalePrice !== undefined && (
                          <>
                            <div className="grid grid-cols-2 text-xs gap-1">
                              <span className="text-muted-foreground">Preço de Venda:</span>
                              <span>{formatCurrency(skin.expectedSalePrice)}</span>
                            </div>
                            
                            {profitInfo.profit !== undefined && (
                              <div className="grid grid-cols-2 text-xs gap-1">
                                <span className="text-muted-foreground">Lucro:</span>
                                <span className={profitInfo.color}>
                                  {formatCurrency(profitInfo.profit)} 
                                  {profitInfo.percentage !== undefined && ` (${profitInfo.percentage.toFixed(1)}%)`}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        
                        {skin.purchaseDate && (
                          <div className="grid grid-cols-2 text-xs gap-1">
                            <span className="text-muted-foreground">Data de Compra:</span>
                            <span>{formatDate(skin.purchaseDate)}</span>
                          </div>
                        )}
                        
                        {skin.purchaseLocation && (
                          <div className="grid grid-cols-2 text-xs gap-1">
                            <span className="text-muted-foreground">Local:</span>
                            <span>{skin.purchaseLocation}</span>
                          </div>
                        )}
                        
                        {skin.comments && (
                          <div className="text-xs pt-1">
                            <span className="text-muted-foreground block mb-0.5">Observações:</span>
                            <p className="italic">{skin.comments}</p>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onDelete}
                    className="h-6 w-6 text-destructive hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{skin.weapon}</span>
              <span>{skin.category}</span>
            </div>
            
            {skin.float !== undefined && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Float:</span>
                  <span className="text-primary font-mono">{skin.float.toFixed(4)}</span>
                </div>
                <div className="float-bar">
                  <div 
                    className="float-indicator" 
                    style={{ width: `${skin.float * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span>0.00</span>
                  <span className="text-muted-foreground">{skin.exterior}</span>
                  <span>1.00</span>
                </div>
              </div>
            )}
            
            {skin.exterior && !skin.float && (
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-muted-foreground">Condição:</span>
                <span>{skin.exterior}</span>
              </div>
            )}
            
            {/* Display purchase info in the card */}
            {skin.purchasePrice !== undefined && skin.expectedSalePrice !== undefined && (
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-muted-foreground">Compra/Venda:</span>
                <span className={profitInfo.color}>
                  {formatCurrency(skin.purchasePrice)} → {formatCurrency(skin.expectedSalePrice)}
                </span>
              </div>
            )}
            
            <div className="pt-1 flex justify-end">
              <span className={`text-xs px-1.5 py-0.5 rounded ${rarityClass} bg-black/20`}>
                {skin.rarity}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinCard;
