
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getConfigValue, setConfigValue } from "@/services/supabase";
import { downloadSkinsData } from "@/services/skins";
import { Download, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const ApiKeysManager = () => {
  const [steamApiKey, setSteamApiKey] = useState("");
  const [byMykelApiUrl, setByMykelApiUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setIsLoading(true);
    try {
      const steamKey = await getConfigValue("steam_api_key");
      if (steamKey) setSteamApiKey(steamKey);

      const byMykelUrl = await getConfigValue("bymykel_api_url");
      if (byMykelUrl) setByMykelApiUrl(byMykelUrl);
    } catch (error) {
      console.error("Error loading API keys:", error);
      toast.error("Failed to load API settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKeys = async () => {
    setIsLoading(true);
    try {
      const steamSuccess = await setConfigValue("steam_api_key", steamApiKey);
      const byMykelSuccess = await setConfigValue(
        "bymykel_api_url",
        byMykelApiUrl || "https://bymykel.github.io/CSGO-API/api/pt-BR/skins.json"
      );

      if (steamSuccess && byMykelSuccess) {
        toast.success("API settings saved successfully");
      } else {
        toast.error("Failed to save some API settings");
      }
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast.error("Failed to save API settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSkinsData = async () => {
    await downloadSkinsData();
  };

  return (
    <Card className="blueprint-card">
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
        <CardDescription>
          Configure API keys and endpoints for Skinculator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="steamApiKey">Steam API Key</Label>
          <Input
            id="steamApiKey"
            type="password"
            value={steamApiKey}
            onChange={(e) => setSteamApiKey(e.target.value)}
            placeholder="Enter your Steam API key"
            className="blueprint-input"
          />
          <p className="text-xs text-muted-foreground">
            Used for fetching Steam inventory data
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="byMykelApiUrl">ByMykel Skins API URL</Label>
          <Input
            id="byMykelApiUrl"
            value={byMykelApiUrl}
            onChange={(e) => setByMykelApiUrl(e.target.value)}
            placeholder="https://bymykel.github.io/CSGO-API/api/pt-BR/skins.json"
            className="blueprint-input"
          />
          <p className="text-xs text-muted-foreground">
            API endpoint for CS2 skins database
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadApiKeys}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Reload
          </Button>
          <Button
            onClick={handleSaveKeys}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
        <Button
          variant="secondary"
          onClick={handleDownloadSkinsData}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Skins Database
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeysManager;
