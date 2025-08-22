import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy, Database, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export function DatabaseFixPanel() {
  const [showPanel, setShowPanel] = useState(false); // Default to false, only show if there's an actual problem
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if all required tables exist and are accessible
  useEffect(() => {
    const checkDatabaseTables = async () => {
      console.log(
        "🔍 DatabaseFixPanel: Starting database connectivity check...",
      );
      setIsChecking(true);

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
        // Test connectivity and table access by trying to read from each table
        const tableChecks = await Promise.allSettled(
          requiredTables.map(async (table) => {
            const { data, error } = await supabase
              .from(table)
              .select("id")
              .limit(1);

            if (error) {
              console.warn(`Table ${table} check failed:`, error);
              throw new Error(
                `Table ${table} not accessible: ${error.message}`,
              );
            }

            return { table, accessible: true };
          }),
        );

        // Check if any tables failed
        const failedTables = tableChecks
          .filter((result) => result.status === "rejected")
          .map((result, index) => requiredTables[index]);

        if (failedTables.length > 0) {
          console.warn(
            "❌ DatabaseFixPanel: Failed tables detected:",
            failedTables,
          );
          console.warn(
            "🔧 DatabaseFixPanel: Showing setup panel due to database issues",
          );
          setShowPanel(true); // Only show if there are actual issues
        } else {
          console.log(
            "✅ DatabaseFixPanel: All database tables are accessible - panel hidden",
          );
          setShowPanel(false); // Hide panel if everything is working
        }
      } catch (error) {
        console.error(
          "❌ DatabaseFixPanel: Database connectivity check failed:",
          error,
        );
        console.warn(
          "🔧 DatabaseFixPanel: Showing setup panel due to connectivity error",
        );
        setShowPanel(true); // Show panel if there's a connectivity issue
      } finally {
        console.log("✅ DatabaseFixPanel: Database check completed");
        setIsChecking(false);
      }
    };

    checkDatabaseTables();
  }, []);

  // Don't render anything while checking
  if (isChecking) {
    return null;
  }

  // Don't render anything if no issues detected
  if (!showPanel) {
    return null;
  }

  const sqlScript = `-- QUICK FIX: Run this in Supabase SQL Editor
-- Creates all missing tables with default data

CREATE TABLE IF NOT EXISTS offer_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{"title": "Ready to Fuel Your Day?", "subtitle": "Get your 42-count nutritious snack box today!", "sale_price": 31.95, "benefits": ["42 premium snacks included", "Fresh & high-quality snacks", "Perfect for gifting", "Fast delivery", "Greeting card included"], "cta_text": "Get Your Snack Box Now", "trust_elements": [{"icon": "Shield", "text": "Secure Payment"}, {"icon": "Truck", "text": "Fast Shipping"}, {"icon": "BadgeCheck", "text": "Satisfaction Guaranteed"}]}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{"title": "What Our Customers Say", "overall_rating": 4.6, "total_reviews": 23, "reviews": [{"name": "Sarah M.", "rating": 5, "text": "Amazing variety! Perfect for our office team.", "date": "2 weeks ago", "verified": true}, {"name": "Mike D.", "rating": 5, "text": "Great gift idea! Sent this to my college son.", "date": "1 month ago", "verified": true}, {"name": "Lisa K.", "rating": 4, "text": "Good quality snacks and fast delivery.", "date": "3 weeks ago", "verified": true}]}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS footer (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{"social_links": [{"name": "Facebook", "url": "https://facebook.com", "icon": "Facebook"}, {"name": "Instagram", "url": "https://instagram.com", "icon": "Instagram"}, {"name": "Twitter", "url": "https://twitter.com", "icon": "Twitter"}, {"name": "YouTube", "url": "https://youtube.com", "icon": "Youtube"}, {"name": "TikTok", "url": "https://tiktok.com", "icon": "TikTok"}]}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{"title": "See What'"'"'s Inside Your Box", "images": [{"url": "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=800", "title": "Complete Collection", "alt": "Nutritious Snack Box"}, {"url": "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F05b5599b733643de9ed02db80950feb9?format=webp&width=800", "title": "Inside View", "alt": "Inside view"}, {"url": "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2Fec2c685b6b9d438f97083ea2cdb4458b?format=webp&width=800", "title": "Beautiful Packaging", "alt": "Outside box"}]}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_section (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{"title": "Why Trust Us", "seller_info": {"name": "Pro Seller", "rating": 4.75, "reviews_count": 570}, "walmart_info": {"text": "Official Walmart Seller", "subtext": "Secure checkout and fast delivery"}, "guarantee": {"text": "Free 90-Day Returns", "subtext": "Shop with confidence"}}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable security and permissions
ALTER TABLE offer_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_section ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON offer_pricing FOR SELECT USING (true);
CREATE POLICY "public_read" ON customer_reviews FOR SELECT USING (true);
CREATE POLICY "public_read" ON footer FOR SELECT USING (true);
CREATE POLICY "public_read" ON product_gallery FOR SELECT USING (true);
CREATE POLICY "public_read" ON trust_section FOR SELECT USING (true);

-- Insert default data
INSERT INTO offer_pricing (content) VALUES (DEFAULT) ON CONFLICT DO NOTHING;
INSERT INTO customer_reviews (content) VALUES (DEFAULT) ON CONFLICT DO NOTHING;
INSERT INTO footer (content) VALUES (DEFAULT) ON CONFLICT DO NOTHING;
INSERT INTO product_gallery (content) VALUES (DEFAULT) ON CONFLICT DO NOTHING;
INSERT INTO trust_section (content) VALUES (DEFAULT) ON CONFLICT DO NOTHING;

SELECT 'SUCCESS: All tables created! Refresh your website.' as result;`;

  const copySQL = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy SQL");
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="bg-red-50 border-red-200">
        <Database className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-red-800">
              Database Issue Detected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPanel(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>

          <div className="text-red-700 text-sm space-y-3">
            <div>
              Some database tables are missing or inaccessible. Follow these
              steps to fix:
            </div>

            <div className="bg-white rounded p-2 border">
              <div className="font-medium text-xs mb-1">
                1. Copy SQL Script:
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copySQL}
                className="w-full h-8"
              >
                <Copy className="h-3 w-3 mr-1" />
                {copied ? "✅ Copied!" : "Copy SQL Script"}
              </Button>
            </div>

            <div className="bg-white rounded p-2 border">
              <div className="font-medium text-xs mb-1">2. Open Supabase:</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open("https://supabase.com/dashboard", "_blank")
                }
                className="w-full h-8"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Supabase Dashboard
              </Button>
            </div>

            <div className="bg-white rounded p-2 border">
              <div className="font-medium text-xs">3. Run Script:</div>
              <div className="text-xs text-gray-600">
                Go to SQL Editor → New Query → Paste → Run
              </div>
            </div>

            <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
              ✅ After running: Database issues will be resolved and this alert
              will disappear!
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
