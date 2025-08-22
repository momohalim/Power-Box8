import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Database } from "lucide-react";

interface TableStatus {
  name: string;
  exists: boolean;
  hasData: boolean;
  error?: string;
}

export function DatabaseSetupChecker() {
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const tables = [
    "seo_settings",
    "hero_section",
    "customer_reviews",
    "footer",
    "offer_pricing",
    "product_gallery",
    "trust_section",
    "why_choose_section",
    "product_popup",
    "exit_intent_popup",
  ];

  const checkTables = async () => {
    setIsChecking(true);
    const statuses: TableStatus[] = [];

    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(1);

        if (error) {
          if (error.code === "PGRST116" || error.code === "42P01") {
            statuses.push({
              name: tableName,
              exists: false,
              hasData: false,
              error: "Table does not exist",
            });
          } else {
            statuses.push({
              name: tableName,
              exists: true,
              hasData: false,
              error: `Error: ${error.message} (Code: ${error.code})`,
            });
          }
        } else {
          statuses.push({
            name: tableName,
            exists: true,
            hasData: data && data.length > 0,
          });
        }
      } catch (e) {
        statuses.push({
          name: tableName,
          exists: false,
          hasData: false,
          error: `Exception: ${e instanceof Error ? e.message : "Unknown error"}`,
        });
      }
    }

    setTableStatuses(statuses);
    setIsChecking(false);
  };

  useEffect(() => {
    checkTables();
  }, []);

  const allTablesExist = tableStatuses.every((status) => status.exists);
  const allTablesHaveData = tableStatuses.every((status) => status.hasData);

  if (!showDetails && allTablesExist && allTablesHaveData) {
    return null; // Hide if everything is working
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="bg-yellow-50 border-yellow-200">
        <Database className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Database Setup Status</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide" : "Show"} Details
            </Button>
          </div>

          {!allTablesExist && (
            <div className="text-amber-700 mb-2">
              ⚠️ Some database tables are missing. Please run the SQL setup
              script.
            </div>
          )}

          {showDetails && (
            <div className="space-y-1 text-sm">
              {tableStatuses.map((status) => (
                <div key={status.name} className="flex items-center gap-2">
                  {status.exists ? (
                    status.hasData ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                    )
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span className="text-xs font-mono">{status.name}</span>
                  {status.error && (
                    <span className="text-xs text-red-600">
                      ({status.error})
                    </span>
                  )}
                </div>
              ))}

              <div className="mt-3 pt-2 border-t border-yellow-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkTables}
                  disabled={isChecking}
                  className="w-full"
                >
                  {isChecking ? "Checking..." : "Refresh Status"}
                </Button>
              </div>
            </div>
          )}

          {!showDetails && !allTablesExist && (
            <div className="text-xs text-amber-600 mt-1">
              Click "Show Details" to see what needs to be set up.
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
