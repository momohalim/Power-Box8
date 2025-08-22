import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  RefreshCw,
} from "lucide-react";

interface TestResult {
  name: string;
  status: "success" | "error" | "warning";
  message: string;
  details?: string;
}

export function SupabaseSetupTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showSqlScript, setShowSqlScript] = useState(false);

  const requiredTables = [
    "hero_section",
    "why_choose_section",
    "product_gallery",
    "trust_section",
    "offer_pricing",
    "customer_reviews",
    "footer",
    "product_popup",
    "exit_intent_popup",
    "seo_settings",
    "email_subscriptions",
  ];

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    const newResults: TestResult[] = [];

    // Test 1: Basic Connection
    try {
      const { data, error } = await supabase
        .from("hero_section")
        .select("id")
        .limit(1);

      if (error) {
        newResults.push({
          name: "Basic Connection",
          status: "error",
          message: "Connection failed",
          details: error.message,
        });
      } else {
        newResults.push({
          name: "Basic Connection",
          status: "success",
          message: "Successfully connected to Supabase",
        });
      }
    } catch (error) {
      newResults.push({
        name: "Basic Connection",
        status: "error",
        message: "Connection exception",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 2: Table Existence and Data
    const missingTables: string[] = [];
    const emptyTables: string[] = [];
    const tablesWithData: string[] = [];

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("id")
          .limit(1);

        if (error) {
          missingTables.push(table);
        } else {
          if (data && data.length > 0) {
            tablesWithData.push(table);
          } else {
            emptyTables.push(table);
          }
        }
      } catch (error) {
        missingTables.push(table);
      }
    }

    newResults.push({
      name: "Tables with Data",
      status:
        tablesWithData.length === requiredTables.length ? "success" : "warning",
      message: `${tablesWithData.length}/${requiredTables.length} tables have data`,
      details: tablesWithData.join(", "),
    });

    if (missingTables.length > 0) {
      newResults.push({
        name: "Missing Tables",
        status: "error",
        message: `${missingTables.length} tables missing`,
        details: missingTables.join(", "),
      });
    }

    if (emptyTables.length > 0) {
      newResults.push({
        name: "Empty Tables",
        status: "warning",
        message: `${emptyTables.length} tables exist but are empty`,
        details: emptyTables.join(", "),
      });
    }

    // Test 3: Real-time Subscriptions
    try {
      let realtimeWorking = false;

      const channel = supabase
        .channel("setup_test")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "hero_section",
          },
          () => {
            realtimeWorking = true;
          },
        )
        .subscribe();

      // Wait for subscription
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Try to trigger an update
      await supabase
        .from("hero_section")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", "test-id"); // This will likely fail but might trigger realtime

      // Wait for potential realtime notification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      supabase.removeChannel(channel);

      newResults.push({
        name: "Real-time Subscriptions",
        status: realtimeWorking ? "success" : "warning",
        message: realtimeWorking
          ? "Real-time working"
          : "Real-time status unknown",
        details:
          "Real-time channels are set up, but testing requires actual data changes",
      });
    } catch (error) {
      newResults.push({
        name: "Real-time Subscriptions",
        status: "error",
        message: "Real-time test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 4: Environment Variables
    const envVars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    };

    const missingEnvVars = Object.entries(envVars)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingEnvVars.length === 0) {
      newResults.push({
        name: "Environment Variables",
        status: "success",
        message: "All required environment variables are set",
      });
    } else {
      newResults.push({
        name: "Environment Variables",
        status: "error",
        message: `Missing environment variables: ${missingEnvVars.join(", ")}`,
        details: "Check your .env file or DevServerControl settings",
      });
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const copySqlScript = () => {
    const sqlScript = `-- Copy and paste this entire script into your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_URL?.split("//")[1]?.split(".")[0]}/sql

-- This script will create all required tables and policies
-- Run the complete content of the 'supabase-setup-final.sql' file from your project

-- Alternative: If you only need the tables without sample data, run this minimal version:

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (without sample data)
${requiredTables
  .map(
    (table) => `
CREATE TABLE IF NOT EXISTS ${table} (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON ${table} FOR SELECT USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON ${table} FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all operations for service role" ON ${table} FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');`,
  )
  .join("\n")}

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'images', 
    'images', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read access for images bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Authenticated upload to images bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- After running this script, refresh this test to verify the setup
`;

    navigator.clipboard.writeText(sqlScript);
    alert(
      "SQL script copied to clipboard! Paste it into your Supabase SQL Editor.",
    );
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500 text-white">Success</Badge>;
      case "error":
        return <Badge className="bg-red-500 text-white">Error</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500 text-white">Warning</Badge>;
    }
  };

  // Auto-run on mount
  useEffect(() => {
    runTests();
  }, []);

  const projectId = import.meta.env.VITE_SUPABASE_URL?.split("//")[1]?.split(
    ".",
  )[0];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Supabase Setup Test
            <Button
              onClick={runTests}
              disabled={isRunning}
              size="sm"
              variant="outline"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh Tests
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.name}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-gray-600">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-gray-500 mt-1">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {results.length === 0 && !isRunning && (
              <p className="text-center text-gray-500">
                No test results yet. Click refresh to run tests.
              </p>
            )}

            {isRunning && (
              <div className="text-center py-4">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-gray-600 mt-2">Running tests...</p>
              </div>
            )}
          </div>

          {results.some(
            (r) => r.status === "error" || r.status === "warning",
          ) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">
                Setup Required
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Your Supabase database needs to be set up. Click the button
                below to copy the SQL script, then paste it into your Supabase
                SQL Editor.
              </p>
              <div className="flex gap-2">
                <Button onClick={copySqlScript} size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Setup SQL
                </Button>
                {projectId && (
                  <Button
                    onClick={() =>
                      window.open(
                        `https://supabase.com/dashboard/project/${projectId}/sql`,
                        "_blank",
                      )
                    }
                    size="sm"
                    variant="outline"
                  >
                    Open SQL Editor
                  </Button>
                )}
              </div>
            </div>
          )}

          {results.every((r) => r.status === "success") && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">
                ✅ Setup Complete!
              </h3>
              <p className="text-sm text-green-700">
                Your Supabase database is properly configured and ready to use.
                All tables exist with data and real-time sync should be working.
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium mb-2">Quick Links</h3>
            <div className="flex gap-2 text-sm">
              {projectId && (
                <>
                  <a
                    href={`https://supabase.com/dashboard/project/${projectId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Supabase Dashboard
                  </a>
                  <span className="text-gray-400">•</span>
                  <a
                    href={`https://supabase.com/dashboard/project/${projectId}/sql`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    SQL Editor
                  </a>
                  <span className="text-gray-400">•</span>
                  <a
                    href={`https://supabase.com/dashboard/project/${projectId}/storage/buckets`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Storage
                  </a>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
