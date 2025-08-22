import { supabase } from "./supabaseClient";

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Enhanced image upload utility that supports multiple storage buckets
 * @param file - The image file to upload
 * @param bucketType - The type of bucket to upload to ('hero', 'customer_reviews', etc.)
 * @returns Promise with success status, URL, or error message
 */
export async function uploadImageToSupabase(
  file: File,
  bucketType: string = "images"
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
      };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File too large. Please upload an image smaller than 5MB.",
      };
    }

    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${bucketType}-${timestamp}-${randomString}.${fileExtension}`;

    // Determine the correct bucket based on bucketType
    let bucketName: string;
    switch (bucketType) {
      case "customer_reviews":
        bucketName = "customer_reviews";
        break;
      case "hero":
      case "images":
      default:
        bucketName = "images";
        break;
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Upload failed: No data returned from Supabase.",
      };
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: "Failed to get public URL for uploaded image.",
      };
    }

    console.log(`✅ Image uploaded successfully to ${bucketName}:`, urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Image upload exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error occurred.",
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The full URL of the image to delete
 * @param bucketType - The bucket the image is stored in
 * @returns Promise with success status
 */
export async function deleteImageFromSupabase(
  imageUrl: string,
  bucketType: string = "images"
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) {
      return {
        success: false,
        error: "Invalid image URL - cannot extract filename.",
      };
    }

    // Determine the correct bucket
    let bucketName: string;
    switch (bucketType) {
      case "customer_reviews":
        bucketName = "customer_reviews";
        break;
      case "hero":
      case "images":
      default:
        bucketName = "images";
        break;
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error("Supabase delete error:", error);
      return {
        success: false,
        error: `Delete failed: ${error.message}`,
      };
    }

    console.log(`✅ Image deleted successfully from ${bucketName}:`, fileName);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Image delete exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown delete error occurred.",
    };
  }
}
