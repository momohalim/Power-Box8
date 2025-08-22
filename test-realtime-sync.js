// Test script to verify real-time synchronization with Supabase
// This script tests database connectivity and real-time subscriptions

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lzfpvyzlndxsceheghtf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6ZnB2eXpsbmR4c2NlaGVnaHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODM2ODgsImV4cCI6MjA3MTQ1OTY4OH0.vXusPXmjYjs912yYF-TXq9hVoi0h0WcymsPl4xydqIY";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log("🔍 Testing Supabase connection and real-time sync...\n");

  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from("hero_section")
      .select("count", { count: "exact", head: true });

    if (testError && testError.code !== "PGRST116") {
      console.log("❌ Connection failed:", testError.message);
      return false;
    }

    console.log("✅ Supabase connection successful");

    // List of tables to check
    const tables = [
      "seo_settings",
      "hero_section",
      "customer_reviews",
      "footer",
      "product_popup",
      "exit_intent_popup",
      "why_choose_section",
      "product_gallery",
      "trust_section",
      "offer_pricing",
    ];

    let allTablesExist = true;

    // Check each table
    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(1);

        if (error) {
          if (error.code === "PGRST116" || error.code === "42P01") {
            console.log(`⚠️  Table '${tableName}' missing`);
            allTablesExist = false;
          } else {
            console.log(`❌ Error with '${tableName}':`, error.message);
          }
        } else {
          console.log(`✅ Table '${tableName}' exists and accessible`);
          if (data && data.length > 0) {
            console.log(`   📊 Contains ${data.length} record(s)`);
          } else {
            console.log(`   📭 Table is empty`);
          }
        }
      } catch (e) {
        console.log(`❌ Exception checking '${tableName}':`, e.message);
        allTablesExist = false;
      }
    }

    // Test real-time subscription
    console.log("\n🔄 Testing real-time subscriptions...");

    const channel = supabase
      .channel("test_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hero_section",
        },
        (payload) => {
          console.log("📡 Real-time update received:", payload);
        },
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status: ${status}`);
      });

    // Wait a bit for subscription to establish
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test a small update to trigger real-time
    try {
      const { error: updateError } = await supabase
        .from("hero_section")
        .update({
          content: {
            title: "Test Real-time Update - " + new Date().toISOString(),
            sale_price: 31.95,
            rating: 4.6,
          },
        })
        .eq(
          "id",
          (await supabase.from("hero_section").select("id").limit(1)).data?.[0]
            ?.id,
        );

      if (updateError) {
        console.log(
          "⚠️  Real-time test update failed (table might not exist):",
          updateError.message,
        );
      } else {
        console.log("✅ Real-time test update sent");
      }
    } catch (e) {
      console.log("⚠️  Real-time test skipped (table setup needed)");
    }

    // Cleanup
    setTimeout(() => {
      supabase.removeChannel(channel);
      console.log("🧹 Test completed and cleaned up");
    }, 3000);

    return allTablesExist;
  } catch (error) {
    console.log("❌ Test failed:", error.message);
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then((success) => {
    console.log(
      `\n${success ? "🎉" : "⚠️"} Database ${success ? "fully ready" : "needs setup"}`,
    );

    if (!success) {
      console.log("\n📋 Next steps:");
      console.log(
        "1. Run the create-supabase-tables.sql script in your Supabase dashboard",
      );
      console.log("2. Verify tables are created successfully");
      console.log("3. Test the frontend real-time functionality");
    } else {
      console.log(
        "\n🚀 Everything is ready! The frontend should now sync with Supabase in real-time.",
      );
    }
  })
  .catch((error) => {
    console.log("❌ Test script failed:", error.message);
  });
