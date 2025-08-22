import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { upsertSingletonWithFixedId } from "@/lib/supabase-helpers";
import { useRealTimeSync } from "@/hooks/use-data-sync";
import { logDatabaseError } from "@/lib/error-handler";

interface GalleryImage {
  url: string;
  title: string;
  alt: string;
}

interface ProductGalleryData {
  title: string;
  images: GalleryImage[];
}

const defaultProductGalleryData: ProductGalleryData = {
  title: "See What's Inside Your Box",
  images: [
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=800",
      title: "Complete Collection",
      alt: "Nutritious Snack Box with Breakfast Bars and Delicious Chips - 42 Count",
    },
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F05b5599b733643de9ed02db80950feb9?format=webp&width=800",
      title: "Inside View",
      alt: "Inside view of snack box",
    },
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2Fec2c685b6b9d438f97083ea2cdb4458b?format=webp&width=800",
      title: "Beautiful Packaging",
      alt: "Outside box view",
    },
  ],
};

export default function InsideBox() {
  const [productData, setProductData] = useState<ProductGalleryData>(
    defaultProductGalleryData,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set up real-time sync
  useRealTimeSync("product_gallery", (payload) => {
    console.log("🔄 Product gallery updated via real-time:", payload);
    if (payload.new && payload.new.content) {
      setProductData(payload.new.content);
    }
  });

  const handleTitleChange = (value: string) => {
    setProductData((prev) => ({ ...prev, title: value }));
  };

  const handleImageChange = (
    index: number,
    field: keyof GalleryImage,
    value: string,
  ) => {
    setProductData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index ? { ...img, [field]: value } : img,
      ),
    }));
  };

  const handleImageUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `product-${index}-${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("images")
          .upload(fileName, file);

        if (error) {
          console.error("Upload error:", error);
          alert("Error uploading image. Please try again.");
          return;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(fileName);

        handleImageChange(index, "url", publicUrl);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Error uploading image. Please try again.");
      }
    }
  };

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from("product_gallery")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.info("Product gallery table not found, using default data");
        } else {
          logDatabaseError("Error loading product gallery data", error);
        }
        setProductData(defaultProductGalleryData);
        return;
      }

      if (data && data.content) {
        setProductData(data.content);
      } else {
        setProductData(defaultProductGalleryData);
      }
    } catch (error) {
      logDatabaseError("Catch block - product gallery error", error);
      console.info(
        "Using default product gallery data due to database connection issue",
      );
      setProductData(defaultProductGalleryData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await upsertSingletonWithFixedId(
        "product_gallery",
        { content: productData },
      );

      if (error) {
        if (error.code === "42P01" || error.code === "PGRST116") {
          alert(
            "Database tables not set up yet. Please run the setup script first.",
          );
          return;
        }
        logDatabaseError("Error saving product gallery", error);
        alert("Error saving Product Gallery section. Please try again.");
      } else {
        // Show success notification
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
        notification.textContent = "Product Gallery saved and synced!";
        document.body.appendChild(notification);

        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      }
    } catch (error) {
      logDatabaseError("Catch block - saving product gallery error", error);
      alert("Error saving Product Gallery section. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Product Preview Section
        </h2>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Main Title */}
      <Card>
        <CardHeader>
          <CardTitle>Section Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={productData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter section title..."
            className="text-lg"
          />
        </CardContent>
      </Card>

      {/* Product Images */}
      <div className="grid lg:grid-cols-1 gap-6">
        {productData.images.map((image, index) => (
          <Card key={index} className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Image {index + 1}</Badge>
                {image.title || "Untitled Image"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Image Title */}
                <div>
                  <Label htmlFor={`image-title-${index}`}>Display Title</Label>
                  <Input
                    id={`image-title-${index}`}
                    value={image.title}
                    onChange={(e) =>
                      handleImageChange(index, "title", e.target.value)
                    }
                    placeholder="Enter image display title..."
                    className="mt-1"
                  />
                </div>

                {/* Alt Text */}
                <div>
                  <Label htmlFor={`alt-text-${index}`}>Alt Text</Label>
                  <Input
                    id={`alt-text-${index}`}
                    value={image.alt}
                    onChange={(e) =>
                      handleImageChange(index, "alt", e.target.value)
                    }
                    placeholder="Enter image alt text..."
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Image Upload/URL */}
              <div>
                <Label>Product Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1">
                  {image.url ? (
                    <div className="space-y-3">
                      <img
                        src={image.url}
                        alt={image.alt || "Product preview"}
                        className="max-w-full h-32 object-contain mx-auto rounded"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById(`image-upload-${index}`)
                              ?.click()
                          }
                          className="flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          Replace
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImageChange(index, "url", "")}
                          className="text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById(`image-upload-${index}`)
                            ?.click()
                        }
                        className="flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Upload Image
                      </Button>
                    </div>
                  )}
                </div>

                <input
                  id={`image-upload-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e)}
                  className="hidden"
                />

                <div className="mt-2">
                  <Label htmlFor={`image-url-${index}`} className="text-sm">
                    Or enter image URL:
                  </Label>
                  <Input
                    id={`image-url-${index}`}
                    value={image.url}
                    onChange={(e) =>
                      handleImageChange(index, "url", e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="text-sm mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Section Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{productData.title}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {productData.images.map((image, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <h4 className="font-semibold text-sm">{image.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
