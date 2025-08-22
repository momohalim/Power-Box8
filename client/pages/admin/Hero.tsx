import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  Upload,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHero } from "@/hooks/use-hero";
import { supabase } from "@/lib/supabaseClient";
import { upsertSingletonWithFixedId } from "@/lib/supabase-helpers";
import { uploadImageToSupabase } from "@/lib/imageUpload";
import {
  showUploadSuccess,
  showUploadError,
  showSaveSuccess,
  showSaveError,
} from "@/lib/notifications";

export default function Hero() {
  const { heroData, updateHeroData, isLoading } = useHero();
  const [localHeroData, setLocalHeroData] = useState(heroData);
  const [isSaving, setIsSaving] = useState(false);

  // Update local data when hero data changes
  useEffect(() => {
    setLocalHeroData(heroData);
  }, [heroData]);

  const handleTitleChange = (value: string) => {
    setLocalHeroData((prev) => ({ ...prev, title: value }));
  };

  const handleRatingChange = (value: string) => {
    const rating = parseFloat(value);
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      setLocalHeroData((prev) => ({ ...prev, rating }));
    }
  };

  const adjustRating = (increment: number) => {
    const newRating = Math.max(
      0,
      Math.min(5, localHeroData.rating + increment),
    );
    setLocalHeroData((prev) => ({ ...prev, rating: newRating }));
  };

  const handleReviewsCountChange = (value: string) => {
    const count = parseInt(value);
    if (!isNaN(count) && count >= 0) {
      setLocalHeroData((prev) => ({ ...prev, reviews_count: count }));
    }
  };

  const handlePriceChange = (value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      setLocalHeroData((prev) => ({ ...prev, sale_price: price }));
    }
  };

  const addFeature = () => {
    setLocalHeroData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setLocalHeroData((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? value : feature,
      ),
    }));
  };

  const removeFeature = (index: number) => {
    if (localHeroData.features.length > 1) {
      setLocalHeroData((prev) => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index),
      }));
    }
  };

  const handlePrimaryCTAChange = (value: string) => {
    setLocalHeroData((prev) => ({ ...prev, primary_cta: value }));
  };

  const handleSecondaryCTAChange = (value: string) => {
    setLocalHeroData((prev) => ({ ...prev, secondary_cta: value }));
  };

  const handleDeliveryTextChange = (value: string) => {
    setLocalHeroData((prev) => ({ ...prev, delivery_text: value }));
  };

  const handleUrgencyTextChange = (value: string) => {
    setLocalHeroData((prev) => ({ ...prev, urgency_text: value }));
  };

  const handleWalmartUrlChange = (value: string) => {
    setLocalHeroData((prev) => ({ ...prev, walmart_url: value }));
  };

  const handleImageChange = (value: string) => {
    setLocalHeroData((prev) => ({ ...prev, main_image: value }));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const originalImage = localHeroData.main_image;

      try {
        // Show loading state with temporary preview
        const tempUrl = URL.createObjectURL(file);
        setLocalHeroData((prev) => ({ ...prev, main_image: tempUrl }));

        // Upload using enhanced utility
        const result = await uploadImageToSupabase(file, "hero");

        if (result.success && result.url) {
          // Update with actual Supabase URL
          setLocalHeroData((prev) => ({ ...prev, main_image: result.url! }));

          // Clean up temporary URL
          URL.revokeObjectURL(tempUrl);

          // Show success notification
          showUploadSuccess("Hero image");
        } else {
          // Revert to original image on error
          setLocalHeroData((prev) => ({ ...prev, main_image: originalImage }));
          URL.revokeObjectURL(tempUrl);

          // Show specific error message
          showUploadError(
            result.error || "Failed to upload image",
            "Hero image",
          );
        }
      } catch (error) {
        // Revert to original image on error
        setLocalHeroData((prev) => ({ ...prev, main_image: originalImage }));
        console.error("Image upload failed:", error);
        showUploadError(
          "Unexpected error during image upload. Please try again.",
          "Hero image",
        );
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("Saving hero data:", localHeroData);

      // Save to Supabase using UUID-compatible helper
      const { data, error } = await upsertSingletonWithFixedId("hero_section", {
        content: localHeroData,
      });

      if (error) {
        // Handle specific error cases
        if (error.code === "42P01") {
          showSaveError(
            "Database tables not set up yet. Please run the setup script first.",
            "Hero section",
          );
          return;
        }
        throw error;
      }

      // Update the global state immediately for better UX
      updateHeroData(localHeroData);

      // Show success notification
      showSaveSuccess("Hero section");

      console.log("Hero data saved successfully:", data);
    } catch (error) {
      console.error("Error saving hero data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Please check your database connection";
      showSaveError(errorMessage, "Hero section");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Hero Section Management
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Form Fields */}
        <div className="space-y-6">
          {/* Main Title */}
          <Card>
            <CardHeader>
              <CardTitle>Main Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={localHeroData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter the main hero title..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Rating Section */}
          <Card>
            <CardHeader>
              <CardTitle>Star Rating</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="rating">Rating Value</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={localHeroData.rating}
                    onChange={(e) => handleRatingChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Adjust Rating</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustRating(-0.1)}
                      disabled={localHeroData.rating <= 0}
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustRating(0.1)}
                      disabled={localHeroData.rating >= 5}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Star Display */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(localHeroData.rating)
                          ? "text-yellow-400 fill-current"
                          : i < localHeroData.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300",
                      )}
                    />
                  ))}
                </div>
                <Badge variant="secondary">
                  {localHeroData.rating.toFixed(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Count */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Label htmlFor="reviews">Number of reviews:</Label>
                <Input
                  id="reviews"
                  type="number"
                  min="0"
                  value={localHeroData.reviews_count}
                  onChange={(e) => handleReviewsCountChange(e.target.value)}
                  className="w-24"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Preview: "from {localHeroData.reviews_count} reviews"
              </p>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sale-price">Sale Price ($)</Label>
                <Input
                  id="sale-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={localHeroData.sale_price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Preview:</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-500 line-through">
                    ${(localHeroData.sale_price * 1.3).toFixed(2)}
                  </span>
                  <span className="text-green-600 font-bold text-lg">
                    ${localHeroData.sale_price.toFixed(2)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Save ${(localHeroData.sale_price * 0.3).toFixed(2)}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: Regular price is automatically calculated as sale price
                  × 1.3
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Buttons Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Button Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary-cta">Primary Button Text</Label>
                <Input
                  id="primary-cta"
                  value={localHeroData.primary_cta}
                  onChange={(e) => handlePrimaryCTAChange(e.target.value)}
                  className="mt-1"
                  placeholder="View Product Details"
                />
              </div>

              <div>
                <Label htmlFor="secondary-cta">Secondary Button Text</Label>
                <Input
                  id="secondary-cta"
                  value={localHeroData.secondary_cta}
                  onChange={(e) => handleSecondaryCTAChange(e.target.value)}
                  className="mt-1"
                  placeholder="Learn More About This Product"
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="delivery-text">Delivery Text</Label>
                <Input
                  id="delivery-text"
                  value={localHeroData.delivery_text}
                  onChange={(e) => handleDeliveryTextChange(e.target.value)}
                  className="mt-1"
                  placeholder="Fast & reliable delivery"
                />
              </div>

              <div>
                <Label htmlFor="urgency-text">Urgency Text</Label>
                <Input
                  id="urgency-text"
                  value={localHeroData.urgency_text}
                  onChange={(e) => handleUrgencyTextChange(e.target.value)}
                  className="mt-1"
                  placeholder="Limited stock available"
                />
              </div>

              <div>
                <Label htmlFor="walmart-url">Walmart URL</Label>
                <Input
                  id="walmart-url"
                  value={localHeroData.walmart_url}
                  onChange={(e) => handleWalmartUrlChange(e.target.value)}
                  className="mt-1"
                  placeholder="https://www.walmart.com/..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Features and Image */}
        <div className="space-y-6">
          {/* Features/Bullet Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Bullet Points / Features
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addFeature}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {localHeroData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Enter feature description..."
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    disabled={localHeroData.features.length === 1}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {localHeroData.main_image ? (
                  <div className="space-y-4">
                    <img
                      src={localHeroData.main_image}
                      alt="Hero preview"
                      className="max-w-full h-32 object-contain mx-auto rounded"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Replace Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600">No image uploaded</p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                        className="mt-2 flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {localHeroData.main_image && (
                <div>
                  <Label htmlFor="image-url">Or enter image URL:</Label>
                  <Input
                    id="image-url"
                    value={localHeroData.main_image}
                    onChange={(e) => handleImageChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
