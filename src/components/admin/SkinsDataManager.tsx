
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, RefreshCw } from "lucide-react";
import { DownloadStatus } from "@/types";
import { format } from "date-fns";
import { downloadAllSkins, getDownloadStatus } from "@/services/skins/skinsManager";

const SkinsDataManager = () => {
  const [status, setStatus] = useState<DownloadStatus>({
    totalSkins: 0,
    downloadedSkins: 0,
    lastUpdated: "",
    isDownloading: false
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setRefreshing(true);
      const currentStatus = await getDownloadStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error("Error fetching download status:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadAllSkins();
      // Status will be updated during the download process
      // by the skinsManager service
    } catch (error) {
      console.error("Error starting download:", error);
    }
  };

  const calculateProgress = (): number => {
    if (status.totalSkins === 0) return 0;
    return Math.round((status.downloadedSkins / status.totalSkins) * 100);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Nunca";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss");
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Banco de Dados de Skins</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchStatus} 
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Gerencie o banco de dados de skins do CS2
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className={status.isDownloading ? "text-amber-500" : "text-green-500"}>
              {status.isDownloading ? "Baixando..." : "Pronto"}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso:</span>
            <span>
              {status.downloadedSkins} / {status.totalSkins} skins
            </span>
          </div>
          
          {status.isDownloading && (
            <Progress value={calculateProgress()} className="h-2" />
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Última atualização:</span>
            <span>{status.lastUpdated ? formatDate(status.lastUpdated) : "Nunca"}</span>
          </div>
          
          {status.error && (
            <div className="text-sm text-destructive pt-2">
              <span className="font-semibold">Erro:</span> {status.error}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleDownload} 
          disabled={status.isDownloading}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar Banco de Dados Completo
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SkinsDataManager;
