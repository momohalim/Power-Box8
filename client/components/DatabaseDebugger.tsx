import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getErrorMessage } from "@/lib/error-handler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Copy } from "lucide-react";

interface TableCheck {
  name: string;
  exists: boolean;
  error?: string;
  errorCode?: string;
}

export function DatabaseDebugger() {
  const [tableChecks, setTableChecks] = useState<TableCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const requiredTables = [
    "offer_pricing",
    "customer_reviews",
    "footer",
    "product_gallery",
    "trust_section",
  ];

  const checkTables = async () => {
    setIsChecking(true);
    const checks: TableCheck[] = [];

    console.log("🔍 Starting database table checks...");

    for (const tableName of requiredTables) {
      try {
        console.log(`Checking table: ${tableName}`);

        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(1);

        if (error) {
          const errorMessage = getErrorMessage(error);
          console.error(`Error for table ${tableName}: ${errorMessage}`);

          checks.push({
            name: tableName,
            exists: false,
            error: errorMessage,
            errorCode: error.code || "unknown",
          });
        } else {
          console.log(`✅ Table ${tableName} exists and is accessible`);
          checks.push({
            name: tableName,
            exists: true,
          });
        }
      } catch (e) {
        const errorMessage = getErrorMessage(e);
        console.error(`Exception checking table ${tableName}: ${errorMessage}`);
        checks.push({
          name: tableName,
          exists: false,
          error: errorMessage,
        });
      }
    }

    setTableChecks(checks);
    setIsChecking(false);
  };

  useEffect(() => {
    checkTables();
  }, []);

  const missingTables = tableChecks.filter((check) => !check.exists);
  const allTablesExist = missingTables.length === 0;

  const quickFixSQL = `-- Quick fix for missing tables
CREATE TABLE IF NOT EXISTS offer_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS footer (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_section (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE offer_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_section ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users" ON offer_pricing FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON customer_reviews FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON footer FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON product_gallery FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON trust_section FOR SELECT USING (true);`;

  const copySQL = () => {
    navigator.clipboard.writeText(quickFixSQL);
  };

  // Hide if everything is working
  if (allTablesExist && !showDetails) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(true)}
          className="bg-green-50 border-green-200 text-green-700"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          DB OK
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert
        className={
          allTablesExist
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">
              Database Status {allTablesExist ? "✅" : "❌"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide" : "Show"}
            </Button>
          </div>

          {!allTablesExist && (
            <div className="text-red-700 mb-3">
              <div className="font-medium">
                Missing {missingTables.length} table(s):
              </div>
              <div className="text-sm">
                {missingTables.map((table) => table.name).join(", ")}
              </div>
            </div>
          )}

          {showDetails && (
            <div className="space-y-2 text-sm">
              {tableChecks.map((check) => (
                <div key={check.name} className="flex items-center gap-2">
                  {check.exists ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span className="font-mono text-xs">{check.name}</span>
                  {check.error && (
                    <span className="text-xs text-red-600">
                      ({check.errorCode || "error"})
                    </span>
                  )}
                </div>
              ))}

              <div className="mt-3 pt-2 border-t space-y-2">
                {!allTablesExist && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySQL}
                    className="w-full"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Quick Fix SQL
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkTables}
                  disabled={isChecking}
                  className="w-full"
                >
                  {isChecking ? "Checking..." : "Refresh"}
                </Button>
              </div>
            </div>
          )}

          {!allTablesExist && !showDetails && (
            <div className="text-xs text-red-600 mt-1">
              Database tables need to be created. Click "Show" for fix.
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
