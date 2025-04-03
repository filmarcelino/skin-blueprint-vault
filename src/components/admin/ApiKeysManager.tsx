
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getByMykelApiUrl, getSteamApiKey, setConfigValue } from "@/services/firebase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkinsDataManager from "./SkinsDataManager";

const ApiKeysManager = () => {
  const [steamApiKey, setSteamApiKey] = useState("");
  const [byMykelApiUrl, setByMykelApiUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const steamKey = await getSteamApiKey();
      const byMykelUrl = await getByMykelApiUrl();
      
      if (steamKey) setSteamApiKey(steamKey);
      if (byMykelUrl) setByMykelApiUrl(byMykelUrl);
    } catch (error) {
      console.error("Error loading config:", error);
      toast.error("Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSteamApiKey = async () => {
    try {
      setIsLoading(true);
      await setConfigValue('steam_api_key', steamApiKey);
      toast.success("Steam API key saved successfully");
    } catch (error) {
      console.error("Error saving Steam API key:", error);
      toast.error("Failed to save Steam API key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveByMykelApiUrl = async () => {
    try {
      setIsLoading(true);
      await setConfigValue('bymykel_api_url', byMykelApiUrl);
      toast.success("ByMykel API URL saved successfully");
    } catch (error) {
      console.error("Error saving ByMykel API URL:", error);
      toast.error("Failed to save ByMykel API URL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="apikeys" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="apikeys">API Keys</TabsTrigger>
        <TabsTrigger value="database">Banco de Dados</TabsTrigger>
      </TabsList>
      
      <TabsContent value="apikeys">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Steam API Key</CardTitle>
              <CardDescription>
                Configure sua chave de API da Steam para integração com o inventário Steam.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="steamApiKey">Chave API da Steam</Label>
                <Input
                  id="steamApiKey"
                  placeholder="Insira sua chave API da Steam"
                  value={steamApiKey}
                  onChange={(e) => setSteamApiKey(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSteamApiKey} disabled={isLoading}>
                Salvar
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>URL da API de Skins</CardTitle>
              <CardDescription>
                Configure a URL da API ByMykel para dados de skins do CS2.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="byMykelApiUrl">URL da API ByMykel</Label>
                <Input
                  id="byMykelApiUrl"
                  placeholder="URL da API de skins"
                  value={byMykelApiUrl}
                  onChange={(e) => setByMykelApiUrl(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveByMykelApiUrl} disabled={isLoading}>
                Salvar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="database">
        <div className="grid gap-4 md:grid-cols-2">
          <SkinsDataManager />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ApiKeysManager;
