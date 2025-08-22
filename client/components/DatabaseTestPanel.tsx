import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { upsertSingletonWithFixedId } from "@/lib/supabase-helpers";
import {
  createTestAdminUser,
  signInAsTestAdmin,
  checkAuthStatus,
} from "@/utils/auth-helper";

export function DatabaseTestPanel() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const clearResults = () => {
    setTestResults([]);
    setAuthStatus(null);
  };

  const testDatabaseRead = async () => {
    try {
      addResult("🔍 Testing database read access...");

      const { data, error } = await supabase
        .from("trust_section")
        .select("*")
        .limit(1);

      if (error) {
        addResult(`❌ Read error: ${error.message}`);
        return false;
      }

      addResult(`✅ Read successful: Found ${data?.length || 0} records`);
      return true;
    } catch (error) {
      addResult(`❌ Read exception: ${error}`);
      return false;
    }
  };

  const testDatabaseWrite = async () => {
    try {
      addResult("✏️ Testing database write access...");

      const testData = {
        title: "Test Write - " + new Date().toISOString(),
        seller_info: { name: "Test", rating: 5, reviews_count: 1 },
        walmart_info: { text: "Test", subtext: "Test" },
        guarantee: { text: "Test", subtext: "Test" },
      };

      const { data, error } = await upsertSingletonWithFixedId(
        "trust_section",
        {
          content: testData,
        },
      );

      if (error) {
        addResult(`❌ Write error: ${error.message}`);
        return false;
      }

      addResult("✅ Write successful: Data saved to database");
      return true;
    } catch (error) {
      addResult(`❌ Write exception: ${error}`);
      return false;
    }
  };

  const checkAuth = async () => {
    const status = await checkAuthStatus();
    setAuthStatus(status);
    addResult(
      `🔐 Auth check: ${status.authenticated ? "✅ Authenticated" : "❌ Not authenticated"}`,
    );
    if (status.user) {
      addResult(`👤 User: ${status.user.email}`);
    }
  };

  const createTestUser = async () => {
    const result = await createTestAdminUser();
    if (result.success) {
      addResult(`✅ ${result.message}`);
    } else {
      addResult(`❌ Failed to create test user: ${result.error}`);
    }
  };

  const signInTestUser = async () => {
    const result = await signInAsTestAdmin();
    if (result.success) {
      addResult("✅ Test admin signed in successfully");
      // Refresh auth status
      await checkAuth();
    } else {
      addResult(`❌ Failed to sign in: ${result.error}`);
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    clearResults();

    addResult("🚀 Starting comprehensive database test...");

    // Check auth status first
    await checkAuth();

    // Test read access
    const readSuccess = await testDatabaseRead();

    // Test write access
    const writeSuccess = await testDatabaseWrite();

    addResult("📊 Test Summary:");
    addResult(`   Read Access: ${readSuccess ? "✅ Working" : "❌ Failed"}`);
    addResult(`   Write Access: ${writeSuccess ? "✅ Working" : "❌ Failed"}`);
    addResult(
      `   Authentication: ${authStatus?.authenticated ? "✅ Active" : "❌ Required"}`,
    );

    if (!writeSuccess && !authStatus?.authenticated) {
      addResult("💡 Tip: Try creating and signing in with test admin user");
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Database Connection & Permissions Test
          {authStatus?.authenticated && (
            <Badge variant="outline" className="text-green-600">
              Authenticated
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={runFullTest} disabled={isLoading} className="w-full">
            {isLoading ? "Testing..." : "🚀 Run Full Test"}
          </Button>
          <Button onClick={clearResults} variant="outline" className="w-full">
            🧹 Clear Results
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={checkAuth} variant="outline" size="sm">
            🔐 Check Auth
          </Button>
          <Button onClick={createTestUser} variant="outline" size="sm">
            👤 Create Test User
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={signInTestUser} variant="outline" size="sm">
            🔑 Sign In Test User
          </Button>
          <Button onClick={testDatabaseWrite} variant="outline" size="sm">
            ✏️ Test Write
          </Button>
        </div>

        {testResults.length > 0 && (
          <Alert>
            <AlertDescription>
              <div className="font-mono text-xs max-h-64 overflow-y-auto">
                {testResults.map((result, idx) => (
                  <div key={idx} className="mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription>
            <strong>Quick Fix Instructions:</strong>
            <br />
            1. Click "Create Test User" to set up admin@test.com
            <br />
            2. Click "Sign In Test User" to authenticate
            <br />
            3. Click "Run Full Test" to verify everything works
            <br />
            4. Now admin dashboard changes should sync to frontend
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
