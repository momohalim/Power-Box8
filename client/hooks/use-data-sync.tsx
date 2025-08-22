import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

interface DataSyncContextType {
  isConnected: boolean;
  lastSync: Date | null;
  syncStatus: "idle" | "syncing" | "error" | "success";
  forceSync: () => Promise<void>;
}

const DataSyncContext = createContext<DataSyncContextType | undefined>(
  undefined,
);

export function DataSyncProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "error" | "success"
  >("idle");

  const checkConnection = async () => {
    try {
      setSyncStatus("syncing");
      const { error } = await supabase
        .from("hero_section")
        .select("id")
        .limit(1);

      if (error) {
        console.warn("Database connection issue:", error);
        setIsConnected(false);
        setSyncStatus("error");
        return;
      }

      setIsConnected(true);
      setLastSync(new Date());
      setSyncStatus("success");

      // Auto-hide success status after 3 seconds
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      console.warn("Data sync connection issue:", error);
      setIsConnected(false);
      setSyncStatus("error");
    }
  };

  const forceSync = async () => {
    await checkConnection();
  };

  useEffect(() => {
    checkConnection();

    // Set up periodic sync check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  // Set up real-time subscriptions for data changes
  useEffect(() => {
    if (!isConnected) return;

    const channels: any[] = [];

    // Subscribe to all table changes for real-time updates
    const tables = [
      "hero_section",
      "why_choose_section",
      "product_gallery",
      "trust_section",
      "customer_reviews",
      "offer_pricing",
      "footer",
      "seo_settings",
      "product_popup",
      "exit_intent_popup",
    ];

    tables.forEach((table) => {
      const channel = supabase
        .channel(`${table}_changes`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: table,
          },
          (payload) => {
            console.log(`🔄 Real-time update detected for ${table}:`, payload);
            setLastSync(new Date());

            // Force refresh data sync status
            setSyncStatus("success");
            setTimeout(() => setSyncStatus("idle"), 2000);

            // Dispatch custom event for components to listen to
            window.dispatchEvent(
              new CustomEvent("data-sync-update", {
                detail: { table, payload },
              }),
            );

            // Dispatch specific table update event
            window.dispatchEvent(
              new CustomEvent(`${table}-update`, {
                detail: payload,
              }),
            );

            // Force page refresh for critical updates if not on admin
            if (
              !window.location.pathname.startsWith("/admin") &&
              payload.eventType === "UPDATE"
            ) {
              console.log(`🔄 Force refreshing ${table} data for frontend`);

              // Dispatch a global refresh event
              window.dispatchEvent(
                new CustomEvent("force-data-refresh", {
                  detail: { table, payload },
                }),
              );
            }
          },
        )
        .subscribe();

      channels.push(channel);
    });

    // Cleanup subscriptions
    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [isConnected]);

  return (
    <DataSyncContext.Provider
      value={{
        isConnected,
        lastSync,
        syncStatus,
        forceSync,
      }}
    >
      {children}
    </DataSyncContext.Provider>
  );
}

export function useDataSync() {
  const context = useContext(DataSyncContext);
  if (context === undefined) {
    throw new Error("useDataSync must be used within a DataSyncProvider");
  }
  return context;
}

// Hook for components to listen to real-time data updates
export function useRealTimeSync(
  tableName: string,
  onUpdate?: (data: any) => void,
) {
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      if (event.detail.table === tableName && onUpdate) {
        onUpdate(event.detail.payload);
      }
    };

    window.addEventListener("data-sync-update" as any, handleUpdate);
    return () =>
      window.removeEventListener("data-sync-update" as any, handleUpdate);
  }, [tableName, onUpdate]);
}
