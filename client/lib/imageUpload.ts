import { supabase } from "./supabaseClient";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImageToSupabase(
  file: File,
  folder: string,
  filename?: string,
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Image file too large. Please choose a file smaller than 5MB",
      };
    }

    // Generate filename if not provided
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const finalFilename = filename || `${folder}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${finalFilename}`;

    console.log(`Uploading image to: ${filePath}`);

    // First, try to create the bucket if it doesn't exist
    try {
      await ensureStorageBucketExists();
    } catch (bucketError) {
      console.warn("Could not verify storage bucket:", bucketError);
      // Continue anyway, the bucket might exist
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);

      // Provide specific error messages based on error code
      if (uploadError.message?.includes("Bucket not found")) {
        return {
          success: false,
          error: "Storage bucket not configured. Please contact administrator.",
        };
      } else if (uploadError.message?.includes("Row level security")) {
        return {
          success: false,
          error:
            "Storage permissions not configured. Please contact administrator.",
        };
      } else if (uploadError.message?.includes("Invalid API key")) {
        return {
          success: false,
          error: "Authentication error. Please contact administrator.",
        };
      } else {
        return {
          success: false,
          error: `Upload failed: ${uploadError.message}`,
        };
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      return {
        success: false,
        error: "Failed to generate public URL for uploaded image",
      };
    }

    console.log("Image uploaded successfully:", urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Image upload failed:", error);
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function ensureStorageBucketExists(): Promise<void> {
  try {
    // Try to list files in bucket to test if it exists
    const { data, error } = await supabase.storage
      .from("images")
      .list("", { limit: 1 });

    if (error && error.message?.includes("Bucket not found")) {
      console.log("Storage bucket does not exist, attempting to create...");

      // Try to create the bucket (might not work without admin privileges)
      const { error: createError } = await supabase.storage.createBucket(
        "images",
        { public: true },
      );

      if (createError) {
        console.warn("Could not create storage bucket:", createError);
        throw new Error("Storage bucket not found and could not be created");
      }

      console.log("Storage bucket created successfully");
    } else if (error) {
      console.warn("Storage bucket test failed:", error);
      throw error;
    } else {
      console.log("Storage bucket exists and is accessible");
    }
  } catch (error) {
    console.error("Storage bucket check failed:", error);
    throw error;
  }
}

// Test function to verify storage setup
export async function testStorageSetup(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Create a small test file
    const testFile = new File(["test"], "test.txt", { type: "text/plain" });

    const result = await uploadImageToSupabase(
      testFile,
      "test",
      "setup-test.txt",
    );

    if (result.success) {
      // Clean up test file
      try {
        await supabase.storage.from("images").remove(["test/setup-test.txt"]);
      } catch (cleanupError) {
        console.warn("Could not clean up test file:", cleanupError);
      }

      return { success: true, message: "Storage setup is working correctly" };
    } else {
      return { success: false, message: result.error || "Storage test failed" };
    }
  } catch (error) {
    return {
      success: false,
      message: `Storage test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
