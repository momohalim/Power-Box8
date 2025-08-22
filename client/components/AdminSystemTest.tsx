import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  Database,
  Wifi,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { testStorageSetup } from "@/lib/imageUpload";
import { useDataSync } from "@/hooks/use-data-sync";

interface TestResult {
  name: string;
  status: "pending" | "running" | "success" | "error";
  message: string;
  details?: string;
}

export function AdminSystemTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { isConnected, syncStatus, forceSync } = useDataSync();

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests((prev) =>
      prev.map((test) => (test.name === name ? { ...test, ...updates } : test)),
    );
  };

  const runTest = async (test: TestResult) => {
    updateTest(test.name, { status: "running", message: "Testing..." });

    try {
      switch (test.name) {
        case "Database Connection":
          await testDatabaseConnection();
          break;
        case "Storage Setup":
          await testStorageSetup();
          break;
        case "Real-time Sync":
          await testRealTimeSync();
          break;
        case "Admin Tables":
          await testAdminTables();
          break;
        case "Image Upload":
          await testImageUpload();
          break;
        default:
          throw new Error("Unknown test");
      }
    } catch (error) {
      updateTest(test.name, {
        status: "error",
        message: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_section")
        .select("id")
        .limit(1);

      if (error) {
        if (error.code === "42P01") {
          updateTest("Database Connection", {
            status: "error",
            message: "Tables not created",
            details: "Run the database setup script first",
          });
        } else {
          throw error;
        }
      } else {
        updateTest("Database Connection", {
          status: "success",
          message: "Connected successfully",
          details: "Database is accessible and tables exist",
        });
      }
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    }
  };

  const testStorageSetup = async () => {
    try {
      const result = await testStorageSetup();

      if (result.success) {
        updateTest("Storage Setup", {
          status: "success",
          message: "Storage configured",
          details: result.message,
        });
      } else {
        updateTest("Storage Setup", {
          status: "error",
          message: "Storage not configured",
          details: result.message,
        });
      }
    } catch (error) {
      throw new Error(`Storage test failed: ${error}`);
    }
  };

  const testRealTimeSync = async () => {
    try {
      // Test if we can subscribe to changes
      const testChannel = supabase
        .channel("test_sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "hero_section" },
          (payload) => {
            console.log("Test sync received:", payload);
          },
        )
        .subscribe();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (testChannel.state === "SUBSCRIBED") {
        updateTest("Real-time Sync", {
          status: "success",
          message: "Real-time sync active",
          details: "Connected to database changes",
        });

        supabase.removeChannel(testChannel);
      } else {
        updateTest("Real-time Sync", {
          status: "error",
          message: "Sync not working",
          details: "Could not subscribe to database changes",
        });
      }
    } catch (error) {
      throw new Error(`Real-time sync test failed: ${error}`);
    }
  };

  const testAdminTables = async () => {
    const requiredTables = [
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

    try {
      const tableChecks = await Promise.allSettled(
        requiredTables.map(async (table) => {
          const { error } = await supabase.from(table).select("id").limit(1);

          if (error && error.code === "42P01") {
            throw new Error(`Table ${table} missing`);
          }
          return table;
        }),
      );

      const failedTables = tableChecks
        .filter((result) => result.status === "rejected")
        .map((result, index) => requiredTables[index]);

      if (failedTables.length === 0) {
        updateTest("Admin Tables", {
          status: "success",
          message: "All tables exist",
          details: `${requiredTables.length} tables verified`,
        });
      } else {
        updateTest("Admin Tables", {
          status: "error",
          message: "Missing tables",
          details: `Missing: ${failedTables.join(", ")}`,
        });
      }
    } catch (error) {
      throw new Error(`Table check failed: ${error}`);
    }
  };

  const testImageUpload = async () => {
    try {
      // Create a small test image file
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0066cc";
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.fillText("TEST", 25, 55);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, "image/png");
      });

      const testFile = new File([blob], "test-image.png", {
        type: "image/png",
      });

      // Try to upload
      const { data, error } = await supabase.storage
        .from("images")
        .upload(`test/admin-test-${Date.now()}.png`, testFile, {
          upsert: true,
        });

      if (error) {
        updateTest("Image Upload", {
          status: "error",
          message: "Upload failed",
          details: error.message,
        });
      } else {
        // Clean up test file
        await supabase.storage.from("images").remove([data.path]);

        updateTest("Image Upload", {
          status: "success",
          message: "Upload working",
          details: "Images can be uploaded and deleted",
        });
      }
    } catch (error) {
      throw new Error(`Image upload test failed: ${error}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);

    // Initialize tests
    const initialTests: TestResult[] = [
      { name: "Database Connection", status: "pending", message: "Not tested" },
      { name: "Admin Tables", status: "pending", message: "Not tested" },
      { name: "Storage Setup", status: "pending", message: "Not tested" },
      { name: "Image Upload", status: "pending", message: "Not tested" },
      { name: "Real-time Sync", status: "pending", message: "Not tested" },
    ];

    setTests(initialTests);

    // Run tests sequentially
    for (const test of initialTests) {
      await runTest(test);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between tests
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 border border-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "running":
        return <Badge variant="secondary">Running</Badge>;
      case "success":
        return <Badge className="bg-green-500">Passed</Badge>;
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Admin System Test Suite
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi
              className={`w-4 h-4 ${isConnected ? "text-green-500" : "text-red-500"}`}
            />
            <span className="text-sm">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw
              className={`w-4 h-4 ${syncStatus === "syncing" ? "animate-spin" : ""} text-blue-500`}
            />
            <span className="text-sm capitalize">{syncStatus}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runAllTests} disabled={isRunning} className="w-full">
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run All Tests"
          )}
        </Button>

        {tests.length > 0 && (
          <div className="space-y-3">
            {tests.map((test) => (
              <div
                key={test.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-gray-600">{test.message}</div>
                    {test.details && (
                      <div className="text-xs text-gray-500 mt-1">
                        {test.details}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Quick Actions</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={forceSync}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Force Sync
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
