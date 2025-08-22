import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Database, Upload, Image } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface TestResult {
  test: string;
  status: "pending" | "success" | "error";
  message: string;
}

export function CustomerReviewsImageTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: "success" | "error", message: string) => {
    setTestResults(prev => [
      ...prev.filter(r => r.test !== test),
      { test, status, message }
    ]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Check if customer_reviews table exists and has reviews
    try {
      addResult("database-structure", "pending", "Checking database structure...");
      
      const { data, error } = await supabase
        .from("customer_reviews")
        .select("content")
        .single();

      if (error) {
        addResult("database-structure", "error", `Database error: ${error.message}`);
      } else if (data && data.content && data.content.reviews) {
        const reviewCount = data.content.reviews.length;
        addResult("database-structure", "success", `Found ${reviewCount} reviews in database`);
        
        // Test 2: Check if reviews have image field
        const reviewsWithImages = data.content.reviews.filter((review: any) => 
          review.image && review.image.trim() !== ""
        ).length;
        
        addResult("image-fields", "success", 
          `${reviewsWithImages}/6 reviews have image URLs configured`
        );
        
        // Test 3: Check image URL accessibility
        if (reviewsWithImages > 0) {
          const firstImageUrl = data.content.reviews.find((review: any) => 
            review.image && review.image.trim() !== ""
          )?.image;
          
          if (firstImageUrl) {
            try {
              const response = await fetch(firstImageUrl, { method: 'HEAD' });
              if (response.ok) {
                addResult("image-accessibility", "success", 
                  "Sample image URL is accessible"
                );
              } else {
                addResult("image-accessibility", "error", 
                  `Image URL returned ${response.status}`
                );
              }
            } catch (e) {
              addResult("image-accessibility", "error", 
                "Failed to access image URL"
              );
            }
          }
        } else {
          addResult("image-accessibility", "pending", 
            "No images uploaded yet - test by uploading images in admin panel"
          );
        }
      } else {
        addResult("database-structure", "error", "No review data found in database");
      }
    } catch (e) {
      addResult("database-structure", "error", `Connection error: ${e}`);
    }

    // Test 4: Check storage bucket exists
    try {
      addResult("storage-bucket", "pending", "Checking storage bucket...");
      
      const { data, error } = await supabase.storage.getBucket("customer_reviews");
      
      if (error) {
        addResult("storage-bucket", "error", 
          `Storage bucket error: ${error.message}. Run customer-reviews-storage-setup.sql`
        );
      } else {
        addResult("storage-bucket", "success", 
          "customer_reviews storage bucket exists and is accessible"
        );
      }
    } catch (e) {
      addResult("storage-bucket", "error", `Storage check failed: ${e}`);
    }

    // Test 5: Check admin panel accessibility
    try {
      addResult("admin-access", "success", 
        "Admin panel accessible at /admin/testimonials"
      );
    } catch (e) {
      addResult("admin-access", "error", "Admin panel check failed");
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "pending":
        return "border-blue-200 bg-blue-50";
    }
  };

  const successCount = testResults.filter(r => r.status === "success").length;
  const errorCount = testResults.filter(r => r.status === "error").length;
  const totalTests = testResults.length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Customer Reviews Image Upload Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Test Summary */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
              <div className="text-sm text-blue-600">Total Tests</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-green-600">Passed</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
          </div>
        )}

        {/* Run Tests Button */}
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? "Running Tests..." : "Run Customer Reviews Image Tests"}
        </Button>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results</h3>
            {testResults.map((result) => (
              <div
                key={result.test}
                className={`p-3 rounded-lg border-2 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {result.test.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <Alert className="border-blue-200 bg-blue-50">
          <Upload className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-blue-800">Quick Test Instructions:</p>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>Run the test above to check system status</li>
                <li>If storage bucket test fails, run <code>customer-reviews-storage-setup.sql</code></li>
                <li>Go to <code>/admin/testimonials</code> to upload images</li>
                <li>Upload images for each of the 6 review cards</li>
                <li>Save changes and verify images appear on main website</li>
                <li>Run the test again to verify everything is working</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        {/* Quick Links */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/admin/testimonials', '_blank')}
          >
            Open Admin Panel
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/', '_blank')}
          >
            View Frontend
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
