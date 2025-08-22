import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy, Database, RefreshCw } from "lucide-react";

export function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<
    "testing" | "connected" | "failed"
  >("testing");
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [showTest, setShowTest] = useState(false);

  const testConnection = async () => {
    setConnectionStatus("testing");
    setErrorDetails(null);

    try {
      // Try a simple query that should work even without tables
      const { data, error } = await supabase
        .from("hero_section")
        .select("count", { count: "exact", head: true });

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          // Table doesn't exist, but connection works
          setConnectionStatus("connected");
        } else {
          // Real connection error
          setConnectionStatus("failed");
          setErrorDetails(error);
        }
      } else {
        setConnectionStatus("connected");
      }
    } catch (e) {
      setConnectionStatus("failed");
      setErrorDetails(e);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const copyErrorToClipboard = () => {
    const errorText = JSON.stringify(errorDetails, null, 2);
    navigator.clipboard.writeText(errorText);
  };

  const sqlScript = `-- Run this in your Supabase SQL Editor:

-- 1. Hero Section Table
CREATE TABLE IF NOT EXISTS hero_section (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customer Reviews Table  
CREATE TABLE IF NOT EXISTS customer_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Footer Table
CREATE TABLE IF NOT EXISTS footer (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Offer Pricing Table
CREATE TABLE IF NOT EXISTS offer_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Product Gallery Table
CREATE TABLE IF NOT EXISTS product_gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Trust Section Table
CREATE TABLE IF NOT EXISTS trust_section (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON hero_section FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON customer_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON footer FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON offer_pricing FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON product_gallery FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON trust_section FOR SELECT USING (true);

-- Insert default data
INSERT INTO hero_section (content) VALUES ('{
    "title": "Nutritious Snack Box with Breakfast Bars and Delicious Chips | Gift A Snack (42 Count)",
    "rating": 4.6,
    "reviews_count": 23,
    "sale_price": 31.95,
    "features": ["Fresh & high-quality snacks", "Walmart+ offer eligible"],
    "delivery_text": "Fast & reliable delivery",
    "urgency_text": "Limited stock available",
    "primary_cta": "View Product Details",
    "secondary_cta": "Learn More About This Product",
    "main_image": "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=800",
    "walmart_url": "https://www.walmart.com/ip/Healthy-Snack-Box-Tasty-Nutrient-Rich-Variety-42-Count-by-Gift-A-Snack/14479818419"
}'::jsonb) ON CONFLICT DO NOTHING;`;

  const copySQL = () => {
    navigator.clipboard.writeText(sqlScript);
  };

  if (!showTest && connectionStatus === "connected") {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTest(true)}
          className="bg-white shadow-lg"
        >
          <Database className="h-3 w-3 mr-1" />
          DB Status
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 max-w-lg">
      <Alert
        className={
          connectionStatus === "connected"
            ? "bg-green-50 border-green-200"
            : connectionStatus === "failed"
              ? "bg-red-50 border-red-200"
              : "bg-yellow-50 border-yellow-200"
        }
      >
        <Database className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">
              Supabase Connection:{" "}
              {connectionStatus === "connected"
                ? "✅ Connected"
                : connectionStatus === "failed"
                  ? "❌ Failed"
                  : "⏳ Testing..."}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={connectionStatus === "testing"}
              >
                <RefreshCw
                  className={`h-3 w-3 ${connectionStatus === "testing" ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTest(false)}
              >
                ✕
              </Button>
            </div>
          </div>

          {connectionStatus === "failed" && errorDetails && (
            <div className="text-red-700 text-sm space-y-2">
              <div>
                <strong>Error:</strong>{" "}
                {errorDetails.message || "Unknown error"}
              </div>
              {errorDetails.code && (
                <div>
                  <strong>Code:</strong> {errorDetails.code}
                </div>
              )}
              {errorDetails.hint && (
                <div>
                  <strong>Hint:</strong> {errorDetails.hint}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={copyErrorToClipboard}
                className="w-full"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Error Details
              </Button>
            </div>
          )}

          {connectionStatus === "connected" && (
            <div className="text-green-700 text-sm space-y-2">
              <div>✅ Supabase connection is working!</div>
              <div>
                If you're seeing data loading errors, you may need to create the
                database tables.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copySQL}
                className="w-full"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy SQL Setup Script
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
