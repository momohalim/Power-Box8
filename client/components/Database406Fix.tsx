import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy, AlertTriangle, CheckCircle, Database, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export function Database406Fix() {
  const [show406Error, setShow406Error] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [copied, setCopied] = useState(false);

  // Tables causing 406 errors according to user report
  const problematicTables = [
    "trust_section",
    "seo_settings", 
    "product_popup",
    "offer_pricing",
    "exit_intent_popup"
  ];

  const check406Issues = async () => {
    setIsChecking(true);
    let has406Issues = false;

    console.log("🔍 Checking for 406 database issues...");

    for (const tableName of problematicTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("id")
          .limit(1);

        if (error) {
          console.error(`❌ 406 issue detected for ${tableName}:`, error);
          has406Issues = true;
          break; // Stop at first error
        }
      } catch (e) {
        console.error(`❌ 406 issue detected for ${tableName}:`, e);
        has406Issues = true;
        break; // Stop at first error
      }
    }

    setShow406Error(has406Issues);
    setIsChecking(false);

    if (has406Issues) {
      console.log("⚠️ 406 errors detected - showing fix banner");
    } else {
      console.log("✅ No 406 errors detected - database is working correctly");
    }
  };

  useEffect(() => {
    // Check for 406 issues on component mount
    check406Issues();
  }, []);

  // SQL fix for 406 errors - minimal and focused
  const fix406SQL = `-- =====================================================
-- QUICK FIX FOR 406 DATABASE ERRORS
-- Copy and paste this into Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create missing tables with content JSONB column
CREATE TABLE IF NOT EXISTS trust_section (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_popup (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offer_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exit_intent_popup (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create permissive policies
ALTER TABLE trust_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_popup ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_intent_popup ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all operations for all users" ON trust_section;
DROP POLICY IF EXISTS "Enable all operations for all users" ON seo_settings;
DROP POLICY IF EXISTS "Enable all operations for all users" ON product_popup;
DROP POLICY IF EXISTS "Enable all operations for all users" ON offer_pricing;
DROP POLICY IF EXISTS "Enable all operations for all users" ON exit_intent_popup;

-- Create permissive policies to fix 406 errors
CREATE POLICY "Enable all operations for all users" ON trust_section FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON seo_settings FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON product_popup FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON offer_pricing FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON exit_intent_popup FOR ALL USING (true);

-- Success message
SELECT '🎉 406 errors fixed! Reload your website to test.' as result;`;

  const copySQL = () => {
    navigator.clipboard.writeText(fix406SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recheck = () => {
    check406Issues();
  };

  // Don't show anything if we're still checking or if no issues
  if (isChecking || !show406Error) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-4xl mx-auto">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-red-800">
                🚨 Database 406 Errors Detected
              </p>
              <p className="text-sm text-red-700">
                Data changes are saved but don't persist after page reload. 
                Tables: trust_section, seo_settings, product_popup, offer_pricing, exit_intent_popup
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={copySQL} 
                size="sm"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Fix SQL"}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={recheck}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Re-check
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShow406Error(false)}
              >
                Dismiss
              </Button>
            </div>

            <div className="text-xs text-red-600 bg-red-100 p-3 rounded-lg">
              <p><strong>📋 Quick Fix Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-1">
                <li>Click "Copy Fix SQL" above</li>
                <li>Go to your Supabase Dashboard → SQL Editor</li>
                <li>Paste and run the SQL script</li>
                <li>Click "Re-check" to verify the fix</li>
                <li>Test: Save changes in admin → Reload page → Data should persist</li>
              </ol>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
