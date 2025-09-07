import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { WifiOff, Wifi } from "lucide-react";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator && isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 md:bottom-6 md:left-6">
      <Badge 
        variant={isOnline ? "default" : "destructive"} 
        className="flex items-center gap-2 px-4 py-2 shadow-lg backdrop-blur-sm"
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="font-mono text-sm">Connexion rétablie</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="font-mono text-sm">Mode hors ligne</span>
          </>
        )}
      </Badge>
    </div>
  );
};

export default OfflineIndicator;