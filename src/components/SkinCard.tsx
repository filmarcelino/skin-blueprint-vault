
import { Skin } from "@/types";
import { calculateExterior } from "@/services/skins";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";

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

const SkinCard = ({ skin, onDelete }: SkinCardProps) => {
  const rarityClass = getRarityClass(skin.rarity);
  
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
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-start gap-2">
              <h3 className={`text-sm font-bold truncate ${rarityClass}`}>
                {skin.name}
              </h3>
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
