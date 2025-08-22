// Database Connectivity Test
// Run this script to verify all tables are accessible
// Usage: node test-database-connectivity.js

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://lzfpvyzlndxsceheghtf.supabase.co";
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6ZnB2eXpsbmR4c2NlaGVnaHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODM2ODgsImV4cCI6MjA3MTQ1OTY4OH0.vXusPXmjYjs912yYF-TXq9hVoi0h0WcymsPl4xydqIY";

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function testDatabaseConnectivity() {
  console.log("🔍 Testing database connectivity...");
  console.log("📍 Supabase URL:", supabaseUrl);
  console.log("");

  const results = [];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select("id").limit(1);

      if (error) {
        results.push({
          table,
          status: "ERROR",
          message: error.message,
          code: error.code,
        });
      } else {
        results.push({
          table,
          status: "OK",
          message: `Accessible (${data ? data.length : 0} records)`,
        });
      }
    } catch (error) {
      results.push({
        table,
        status: "FAILED",
        message: error.message,
      });
    }
  }

  // Print results
  console.log("📊 Database Connectivity Results:");
  console.log("================================");

  let allOk = true;
  results.forEach((result) => {
    const icon = result.status === "OK" ? "✅" : "❌";
    console.log(
      `${icon} ${result.table.padEnd(20)} | ${result.status.padEnd(6)} | ${result.message}`,
    );
    if (result.status !== "OK") {
      allOk = false;
    }
  });

  console.log("");
  if (allOk) {
    console.log("🎉 SUCCESS: All database tables are accessible!");
    console.log(
      "✅ The DatabaseFixPanel popup should NOT appear on your website.",
    );
  } else {
    console.log("⚠️  WARNING: Some tables have issues.");
    console.log(
      "❌ The DatabaseFixPanel popup will appear until these are fixed.",
    );
  }

  return allOk;
}

// Run the test
testDatabaseConnectivity()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  });
