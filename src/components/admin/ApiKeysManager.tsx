
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { getConfigValue, setConfigValue } from "@/services/firebase";

const ApiKeysManager = () => {
  const [steamApiKey, setSteamApiKey] = useState("");
  const [bymykelUrl, setBymykelUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const steamKey = await getConfigValue("steam_api_key");
        const apiUrl = await getConfigValue("bymykel_api_url");
        
        if (steamKey) setSteamApiKey(steamKey);
        if (apiUrl) setBymykelUrl(apiUrl);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading API keys:", error);
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);
  
  const handleSaveSteamKey = async () => {
    try {
      const success = await setConfigValue("steam_api_key", steamApiKey);
      if (success) {
        toast.success("Steam API key saved successfully");
      } else {
        toast.error("Failed to save Steam API key");
      }
    } catch (error) {
      console.error("Error saving Steam API key:", error);
      toast.error("Failed to save Steam API key");
    }
  };
  
  const handleSaveBymykelUrl = async () => {
    try {
      const success = await setConfigValue("bymykel_api_url", bymykelUrl);
      if (success) {
        toast.success("ByMykel API URL saved successfully");
      } else {
        toast.error("Failed to save ByMykel API URL");
      }
    } catch (error) {
      console.error("Error saving ByMykel API URL:", error);
      toast.error("Failed to save ByMykel API URL");
    }
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading configuration...</div>;
  }

  return (
    <Card className="blueprint-card">
      <CardContent className="space-y-6 pt-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">API Keys Configuration</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Configure API keys for external services.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="steamApiKey">Steam Web API Key</Label>
            <div className="flex gap-2">
              <Input
                id="steamApiKey"
                value={steamApiKey}
                onChange={(e) => setSteamApiKey(e.target.value)}
                placeholder="Enter your Steam Web API Key"
                className="flex-1"
              />
              <Button onClick={handleSaveSteamKey}>Save</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Used for fetching Steam inventory data. Get one at{" "}
              <a
                href="https://steamcommunity.com/dev/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                steamcommunity.com/dev/apikey
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bymykelUrl">ByMykel CS2 API URL</Label>
            <div className="flex gap-2">
              <Input
                id="bymykelUrl"
                value={bymykelUrl}
                onChange={(e) => setBymykelUrl(e.target.value)}
                placeholder="Enter the ByMykel CS2 API URL"
                className="flex-1"
              />
              <Button onClick={handleSaveBymykelUrl}>Save</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              URL to fetch CS2 skins data from ByMykel's API.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeysManager;
