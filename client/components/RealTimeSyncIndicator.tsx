import { useDataSync } from "@/hooks/use-data-sync";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, WifiOff, Loader2, AlertCircle, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealTimeSyncIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function RealTimeSyncIndicator({
  className,
  showLabel = true,
}: RealTimeSyncIndicatorProps) {
  const { isConnected, syncStatus, lastSync } = useDataSync();

  const getStatusConfig = () => {
    if (!isConnected) {
      return {
        icon: WifiOff,
        label: "Offline",
        variant: "destructive" as const,
        className: "text-red-600",
      };
    }

    switch (syncStatus) {
      case "syncing":
        return {
          icon: Loader2,
          label: "Syncing...",
          variant: "secondary" as const,
          className: "text-blue-600 animate-spin",
        };
      case "success":
        return {
          icon: CheckCircle,
          label: "Synced",
          variant: "secondary" as const,
          className: "text-green-600",
        };
      case "error":
        return {
          icon: AlertCircle,
          label: "Error",
          variant: "destructive" as const,
          className: "text-red-600",
        };
      default:
        return {
          icon: Wifi,
          label: "Connected",
          variant: "secondary" as const,
          className: "text-gray-600",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const IconComponent = statusConfig.icon;

  const formatLastSync = () => {
    if (!lastSync) return "";
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      const diffMinutes = Math.floor(diffSeconds / 60);
      return `${diffMinutes}m ago`;
    } else {
      return lastSync.toLocaleTimeString();
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
        <IconComponent className={cn("w-3 h-3", statusConfig.className)} />
        {showLabel && statusConfig.label}
      </Badge>

      {lastSync && syncStatus === "idle" && (
        <span className="text-xs text-gray-500">{formatLastSync()}</span>
      )}
    </div>
  );
}
