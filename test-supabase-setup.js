import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables");
  console.log("VITE_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
  console.log(
    "VITE_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "✅ Set" : "❌ Missing",
  );
  console.log(
    "VITE_SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceKey ? "✅ Set" : "❌ Missing",
  );
  process.exit(1);
}

// Create clients
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

console.log("🚀 Testing Supabase Configuration");
console.log("📍 URL:", supabaseUrl);
console.log("🔑 Using correct credentials for your project");
console.log("");

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

async function testConnection() {
  console.log("1️⃣ Testing basic connection...");

  try {
    const { data, error } = await supabaseAnon
      .from("hero_section")
      .select("id")
      .limit(1);

    if (error) {
      console.error("❌ Connection test failed:", error.message);
      return false;
    }

    console.log("✅ Connection successful");
    return true;
  } catch (error) {
    console.error("❌ Connection exception:", error.message);
    return false;
  }
}

async function checkTables() {
  console.log("\n2️⃣ Checking required tables...");

  const missingTables = [];
  const tablesWithData = [];
  const emptyTables = [];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabaseAnon
        .from(table)
        .select("id")
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        missingTables.push(table);
      } else {
        if (data && data.length > 0) {
          console.log(`✅ ${table}: Has data`);
          tablesWithData.push(table);
        } else {
          console.log(`⚠️  ${table}: Exists but empty`);
          emptyTables.push(table);
        }
      }
    } catch (error) {
      console.log(`❌ ${table}: Exception - ${error.message}`);
      missingTables.push(table);
    }
  }

  return { missingTables, tablesWithData, emptyTables };
}

async function testRealTimeSync() {
  console.log("\n3️⃣ Testing real-time synchronization...");

  let updateReceived = false;

  try {
    // Set up real-time listener
    const channel = supabaseAnon
      .channel("test_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hero_section",
        },
        (payload) => {
          console.log("✅ Real-time update received:", payload.eventType);
          updateReceived = true;
        },
      )
      .subscribe();

    // Wait for subscription to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Make a test update using service role if available
    if (supabaseAdmin) {
      console.log("🔄 Making test update...");

      const { error: updateError } = await supabaseAdmin
        .from("hero_section")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq(
          "id",
          (await supabaseAnon.from("hero_section").select("id").limit(1))
            .data?.[0]?.id,
        );

      if (updateError) {
        console.log("❌ Test update failed:", updateError.message);
      }
    }

    // Wait for real-time notification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (updateReceived) {
      console.log("✅ Real-time sync working correctly");
    } else {
      console.log("⚠️  Real-time sync may not be working - no update received");
    }

    // Cleanup
    supabaseAnon.removeChannel(channel);
  } catch (error) {
    console.error("❌ Real-time test failed:", error.message);
  }
}

async function testAuthentication() {
  console.log("\n4️⃣ Testing authentication capabilities...");

  try {
    // Test anonymous access (should work for reads)
    const { data: readData, error: readError } = await supabaseAnon
      .from("hero_section")
      .select("*")
      .limit(1);

    if (readError) {
      console.log("❌ Anonymous read failed:", readError.message);
    } else {
      console.log("✅ Anonymous read access working");
    }

    // Test write permissions with service role
    if (supabaseAdmin) {
      const testData = { content: { test: "write_test_" + Date.now() } };

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from("hero_section")
        .insert(testData)
        .select();

      if (insertError) {
        console.log("❌ Admin write failed:", insertError.message);
      } else {
        console.log("✅ Admin write access working");

        // Clean up test data
        if (insertData && insertData[0]) {
          await supabaseAdmin
            .from("hero_section")
            .delete()
            .eq("id", insertData[0].id);
        }
      }
    } else {
      console.log("⚠️  Service role key not available - skipping write test");
    }
  } catch (error) {
    console.error("❌ Authentication test failed:", error.message);
  }
}

async function main() {
  console.log("🔍 Comprehensive Supabase Setup Test\n");

  // Test connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log(
      "\n❌ Basic connection failed. Please check your Supabase credentials and ensure the database is accessible.",
    );
    return;
  }

  // Check tables
  const { missingTables, tablesWithData, emptyTables } = await checkTables();

  // Test real-time
  await testRealTimeSync();

  // Test authentication
  await testAuthentication();

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📋 SUMMARY");
  console.log("=".repeat(50));

  if (missingTables.length === 0) {
    console.log("✅ All required tables exist");
  } else {
    console.log("❌ Missing tables:", missingTables.join(", "));
  }

  console.log(`✅ Tables with data: ${tablesWithData.length}`);

  if (emptyTables.length > 0) {
    console.log(
      `⚠️  Empty tables: ${emptyTables.length} (${emptyTables.join(", ")})`,
    );
  }

  console.log("\n🔧 NEXT STEPS:");

  if (missingTables.length > 0 || emptyTables.length > 0) {
    console.log(
      "1. Run the 'supabase-setup-final.sql' script in your Supabase SQL Editor",
    );
    console.log(
      "   - Go to https://supabase.com/dashboard/project/" +
        supabaseUrl.split("//")[1].split(".")[0] +
        "/sql",
    );
    console.log(
      "   - Copy and paste the entire supabase-setup-final.sql content",
    );
    console.log("   - Click 'Run' to execute");
  }

  if (tablesWithData.length === requiredTables.length) {
    console.log("✅ Your database is properly configured!");
    console.log("✅ Frontend should now sync with backend in real-time");
  }

  console.log("\n🌐 Dashboard URLs:");
  console.log(
    "- Supabase Dashboard: https://supabase.com/dashboard/project/" +
      supabaseUrl.split("//")[1].split(".")[0],
  );
  console.log(
    "- SQL Editor: https://supabase.com/dashboard/project/" +
      supabaseUrl.split("//")[1].split(".")[0] +
      "/sql",
  );
  console.log(
    "- Storage: https://supabase.com/dashboard/project/" +
      supabaseUrl.split("//")[1].split(".")[0] +
      "/storage/buckets",
  );
}

main().catch(console.error);
