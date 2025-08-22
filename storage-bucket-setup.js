/**
 * Supabase Storage Bucket Setup Script
 *
 * This script creates the 'images' storage bucket and sets up proper policies
 * for uploading and accessing images from the admin panel.
 *
 * Run this script in your browser console while on the admin panel,
 * or execute the SQL commands in your Supabase SQL Editor.
 */

import { supabase } from "./client/lib/supabaseClient.js";

async function setupStorageBucket() {
  console.log("🚀 Setting up Supabase Storage bucket...");

  try {
    // Step 1: Create the bucket
    console.log("📦 Creating images bucket...");
    const { data: bucket, error: bucketError } =
      await supabase.storage.createBucket("images", {
        public: true,
        allowedMimeTypes: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ],
        fileSizeLimit: 5242880, // 5MB
      });

    if (bucketError) {
      if (bucketError.message?.includes("already exists")) {
        console.log("✅ Images bucket already exists");
      } else {
        console.error("❌ Error creating bucket:", bucketError);
        return false;
      }
    } else {
      console.log("✅ Images bucket created successfully");
    }

    // Step 2: Test bucket access
    console.log("🔍 Testing bucket access...");
    const { data: files, error: listError } = await supabase.storage
      .from("images")
      .list("", { limit: 1 });

    if (listError) {
      console.error("❌ Error accessing bucket:", listError);
      return false;
    }

    console.log("✅ Bucket access verified");

    // Step 3: Test upload functionality
    console.log("📤 Testing upload functionality...");
    const testFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload("test/setup-test.txt", testFile, { upsert: true });

    if (uploadError) {
      console.error("❌ Error testing upload:", uploadError);
      return false;
    }

    console.log("✅ Upload test successful");

    // Step 4: Test public URL generation
    console.log("🔗 Testing public URL generation...");
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl("test/setup-test.txt");

    if (!urlData.publicUrl) {
      console.error("❌ Error generating public URL");
      return false;
    }

    console.log("✅ Public URL generation verified:", urlData.publicUrl);

    // Step 5: Clean up test file
    console.log("🧹 Cleaning up test file...");
    await supabase.storage.from("images").remove(["test/setup-test.txt"]);

    console.log("🎉 Storage bucket setup completed successfully!");
    return true;
  } catch (error) {
    console.error("💥 Setup failed:", error);
    return false;
  }
}

// Auto-run if in browser environment
if (typeof window !== "undefined") {
  setupStorageBucket().then((success) => {
    if (success) {
      console.log("💡 You can now upload images in the admin panel!");
    } else {
      console.log("⚠️  Please check the setup instructions and try again.");
      console.log("📚 Documentation: https://supabase.com/docs/guides/storage");
    }
  });
}

/**
 * Alternative: Run these SQL commands in your Supabase SQL Editor
 * if the JavaScript approach doesn't work:
 */
const sqlCommands = `
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public access to images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- Create policy to allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'images'
);

-- Create policy to allow authenticated updates
CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE USING (
  bucket_id = 'images'
);

-- Create policy to allow authenticated deletes  
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE USING (
  bucket_id = 'images'
);
`;

console.log("📝 SQL Commands for manual setup:");
console.log(sqlCommands);

export default setupStorageBucket;
