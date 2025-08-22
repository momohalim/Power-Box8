import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Database, ExternalLink, Loader2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface TableStatus {
  name: string;
  exists: boolean;
  error?: string;
  errorCode?: string;
  hasContentColumn?: boolean;
}

export function DatabaseDiagnosis() {
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const [showSQL, setShowSQL] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tables that are causing 406 errors according to user report
  const problematicTables = [
    "trust_section",
    "seo_settings", 
    "product_popup",
    "offer_pricing",
    "exit_intent_popup"
  ];

  // All tables from schema
  const allRequiredTables = [
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
    "email_subscriptions"
  ];

  const checkTables = async () => {
    setIsChecking(true);
    const statuses: TableStatus[] = [];

    console.log("🔍 Starting comprehensive database diagnosis...");

    for (const tableName of allRequiredTables) {
      try {
        console.log(`Checking table: ${tableName}`);

        // First try to select from the table
        const { data, error } = await supabase
          .from(tableName)
          .select("id, content")
          .limit(1);

        if (error) {
          console.error(`❌ Error accessing ${tableName}:`, error);
          statuses.push({
            name: tableName,
            exists: false,
            error: error.message,
            errorCode: error.code,
          });
        } else {
          console.log(`✅ Table ${tableName} is accessible`);
          
          // Check if it has content column by checking the data structure
          const hasContentColumn = data && data.length > 0 ? 
            'content' in data[0] : 
            true; // Assume true if no data, we'll check structure separately

          statuses.push({
            name: tableName,
            exists: true,
            hasContentColumn,
          });
        }
      } catch (e) {
        console.error(`❌ Exception checking ${tableName}:`, e);
        statuses.push({
          name: tableName,
          exists: false,
          error: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }

    setTableStatuses(statuses);
    setIsChecking(false);

    // Log summary
    const workingTables = statuses.filter(t => t.exists);
    const brokenTables = statuses.filter(t => !t.exists);
    
    console.log(`📊 Database Diagnosis Summary:`);
    console.log(`✅ Working tables: ${workingTables.length}/${allRequiredTables.length}`);
    console.log(`❌ Broken tables: ${brokenTables.length}/${allRequiredTables.length}`);
    
    if (brokenTables.length > 0) {
      console.log(`🔧 Tables needing fixes:`, brokenTables.map(t => t.name));
    }
  };

  useEffect(() => {
    checkTables();
  }, []);

  const brokenTables = tableStatuses.filter(t => !t.exists);
  const problematicBroken = brokenTables.filter(t => problematicTables.includes(t.name));

  // SQL to fix all missing tables with proper RLS policies
  const fullFixSQL = `-- =====================================================
-- COMPREHENSIVE DATABASE FIX
-- This creates all missing tables with proper structure
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create missing tables with content JSONB column
${brokenTables.map(table => `
CREATE TABLE IF NOT EXISTS ${table.name} (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`).join('\n')}

-- Enable Row Level Security
${brokenTables.map(table => `ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;`).join('\n')}

-- Drop existing policies to avoid conflicts
${brokenTables.map(table => `
DROP POLICY IF EXISTS "Enable read access for all users" ON ${table.name};
DROP POLICY IF EXISTS "Enable all operations for service role" ON ${table.name};
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON ${table.name};
DROP POLICY IF EXISTS "Enable all operations for all users" ON ${table.name};`).join('\n')}

-- Create permissive policies (for development/testing)
${brokenTables.map(table => `
CREATE POLICY "Enable read access for all users" ON ${table.name} FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON ${table.name} FOR ALL USING (true);`).join('\n')}

-- Create email_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) DEFAULT 'exit_intent_popup',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable insert for all users" ON email_subscriptions;
DROP POLICY IF EXISTS "Enable all operations for service role" ON email_subscriptions;
CREATE POLICY "Enable insert for all users" ON email_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable all operations for service role" ON email_subscriptions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create unique constraint on email
CREATE UNIQUE INDEX IF NOT EXISTS email_subscriptions_email_unique ON email_subscriptions(email);

-- Add update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
${brokenTables.filter(t => t.name !== 'email_subscriptions').map(table => `
DROP TRIGGER IF EXISTS update_${table.name}_updated_at ON ${table.name};
CREATE TRIGGER update_${table.name}_updated_at 
    BEFORE UPDATE ON ${table.name} 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();`).join('\n')}

-- Success message
SELECT '🎉 Database fix completed! All tables should now be accessible.' as result;`;

  const copySQL = () => {
    navigator.clipboard.writeText(fullFixSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (table: TableStatus) => {
    if (table.exists) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (problematicTables.includes(table.name)) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusColor = (table: TableStatus) => {
    if (table.exists) return "border-green-200 bg-green-50";
    if (problematicTables.includes(table.name)) return "border-red-200 bg-red-50";
    return "border-yellow-200 bg-yellow-50";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Diagnosis & Fix Tool
          {isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{tableStatuses.length}</div>
            <div className="text-sm text-blue-600">Total Tables</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {tableStatuses.filter(t => t.exists).length}
            </div>
            <div className="text-sm text-green-600">Working</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {problematicBroken.length}
            </div>
            <div className="text-sm text-red-600">406 Error Tables</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {brokenTables.length - problematicBroken.length}
            </div>
            <div className="text-sm text-yellow-600">Other Issues</div>
          </div>
        </div>

        {/* Table Status Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Table Status Details</h3>
          <div className="grid gap-2">
            {tableStatuses.map((table) => (
              <div
                key={table.name}
                className={`p-3 rounded-lg border-2 ${getStatusColor(table)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(table)}
                    <code className="font-mono text-sm">{table.name}</code>
                    {problematicTables.includes(table.name) && (
                      <Badge variant="destructive" className="text-xs">
                        406 Error
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">
                    {table.exists ? (
                      <span className="text-green-600 font-medium">✓ Accessible</span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        ✗ {table.errorCode || "Missing"}
                      </span>
                    )}
                  </div>
                </div>
                {table.error && (
                  <div className="mt-2 text-xs text-red-600 font-mono">
                    {table.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fix Actions */}
        {brokenTables.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-orange-800">
                    Database Fix Required
                  </p>
                  <p className="text-sm text-orange-700">
                    {brokenTables.length} tables are missing or inaccessible. 
                    {problematicBroken.length > 0 && (
                      <> This includes {problematicBroken.length} tables causing 406 errors.</>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={copySQL} className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy Fix SQL"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSQL(!showSQL)}
                  >
                    {showSQL ? "Hide" : "Show"} SQL
                  </Button>
                  <Button variant="outline" onClick={checkTables}>
                    Re-check
                  </Button>
                </div>

                {showSQL && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">SQL Fix Script:</div>
                    <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-96">
                      {fullFixSQL}
                    </pre>
                  </div>
                )}

                <div className="text-xs text-orange-600">
                  <p><strong>Instructions:</strong></p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Copy the SQL script above</li>
                    <li>Go to your Supabase Dashboard → SQL Editor</li>
                    <li>Paste and run the script</li>
                    <li>Click "Re-check" to verify the fix</li>
                  </ol>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {brokenTables.length === 0 && !isChecking && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold text-green-800">All Tables Working!</p>
              <p className="text-sm text-green-700">
                All database tables are accessible and should be working correctly.
                If you're still experiencing issues, they may be related to RLS policies or network connectivity.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
