import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Save, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { useRealTimeSync } from "@/hooks/use-data-sync";
import { logDatabaseError } from "@/lib/error-handler";

interface SellerInfo {
  name: string;
  rating: number;
  reviews_count: number;
}

interface WalmartInfo {
  text: string;
  subtext: string;
}

interface GuaranteeInfo {
  text: string;
  subtext: string;
}

interface TrustData {
  title: string;
  seller_info: SellerInfo;
  walmart_info: WalmartInfo;
  guarantee: GuaranteeInfo;
}

const defaultTrustData: TrustData = {
  title: "Why Trust Us",
  seller_info: {
    name: "Pro Seller",
    rating: 4.75,
    reviews_count: 570,
  },
  walmart_info: {
    text: "Official Walmart Seller",
    subtext: "Secure checkout and fast delivery",
  },
  guarantee: {
    text: "Free 90-Day Returns",
    subtext: "Shop with confidence - easy returns",
  },
};

export default function Walmart() {
  const [trustData, setTrustData] = useState<TrustData>(defaultTrustData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set up real-time sync
  useRealTimeSync("trust_section", (payload) => {
    console.log("🔄 Trust section updated via real-time:", payload);
    if (payload.new && payload.new.content) {
      setTrustData(payload.new.content);
    }
  });

  const handleTitleChange = (value: string) => {
    setTrustData((prev) => ({ ...prev, title: value }));
  };

  const handleSellerInfoChange = (
    field: keyof SellerInfo,
    value: string | number,
  ) => {
    setTrustData((prev) => ({
      ...prev,
      seller_info: {
        ...prev.seller_info,
        [field]: value,
      },
    }));
  };

  const handleWalmartInfoChange = (field: keyof WalmartInfo, value: string) => {
    setTrustData((prev) => ({
      ...prev,
      walmart_info: {
        ...prev.walmart_info,
        [field]: value,
      },
    }));
  };

  const handleGuaranteeChange = (field: keyof GuaranteeInfo, value: string) => {
    setTrustData((prev) => ({
      ...prev,
      guarantee: {
        ...prev.guarantee,
        [field]: value,
      },
    }));
  };

  const handleSellerRatingChange = (value: string) => {
    const rating = parseFloat(value);
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      handleSellerInfoChange("rating", rating);
    }
  };

  const adjustSellerRating = (increment: number) => {
    const currentRating = trustData.seller_info.rating;
    const newRating = Math.max(0, Math.min(5, currentRating + increment));
    handleSellerInfoChange("rating", newRating);
  };

  const handleReviewsCountChange = (value: string) => {
    const count = parseInt(value);
    if (!isNaN(count) && count >= 0) {
      handleSellerInfoChange("reviews_count", count);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("Saving trust data:", trustData);

      // Save to Supabase trust_section table
      const { data, error } = await supabase.from("trust_section").upsert({
        id: 1,
        content: trustData,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        if (error.code === "42P01" || error.code === "PGRST116") {
          alert(
            "Database tables not set up yet. Please run the setup script first.",
          );
          return;
        }
        logDatabaseError("Error saving trust section", error);
        throw error;
      }

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
      notification.textContent = "Trust section saved and synced!";
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error("Error saving walmart data:", error);
      alert("Error saving Trust section. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from("trust_section")
          .select("*")
          .single();

        if (error) {
          if (error.code === "PGRST116" || error.code === "42P01") {
            console.info("Trust section table not found, using default data");
          } else {
            logDatabaseError("Error loading trust section data", error);
          }
          setTrustData(defaultTrustData);
          return;
        }

        if (data && data.content) {
          setTrustData(data.content);
        } else {
          setTrustData(defaultTrustData);
        }
      } catch (error) {
        logDatabaseError("Catch block - trust section error", error);
        console.info(
          "Using default trust data due to database connection issue",
        );
        setTrustData(defaultTrustData);
      } finally {
        setIsLoading(false);
      }
    };

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
          Trust Section Management
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
            value={trustData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter section title..."
            className="text-lg font-semibold"
          />
        </CardContent>
      </Card>

      {/* Seller Info */}
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Seller Info</Badge>
            Seller Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="seller-name">Seller Name</Label>
              <Input
                id="seller-name"
                value={trustData.seller_info.name}
                onChange={(e) => handleSellerInfoChange("name", e.target.value)}
                placeholder="Enter seller name..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="seller-rating">Rating</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="seller-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.01"
                  value={trustData.seller_info.rating}
                  onChange={(e) => handleSellerRatingChange(e.target.value)}
                  className="w-20"
                />
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustSellerRating(-0.1)}
                    disabled={trustData.seller_info.rating <= 0}
                  >
                    -
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustSellerRating(0.1)}
                    disabled={trustData.seller_info.rating >= 5}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="reviews-count">Reviews Count</Label>
              <Input
                id="reviews-count"
                type="number"
                min="0"
                value={trustData.seller_info.reviews_count}
                onChange={(e) => handleReviewsCountChange(e.target.value)}
                placeholder="Number of reviews..."
                className="mt-1"
              />
            </div>
          </div>

          {/* Star Display */}
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.floor(trustData.seller_info.rating)
                      ? "text-yellow-400 fill-current"
                      : i < trustData.seller_info.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300",
                  )}
                />
              ))}
            </div>
            <Badge variant="secondary">
              {trustData.seller_info.rating.toFixed(2)} from{" "}
              {trustData.seller_info.reviews_count} reviews
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Walmart Info */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Walmart</Badge>
            Walmart Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="walmart-text">Main Text</Label>
              <Input
                id="walmart-text"
                value={trustData.walmart_info.text}
                onChange={(e) =>
                  handleWalmartInfoChange("text", e.target.value)
                }
                placeholder="Enter main text..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="walmart-subtext">Subtext</Label>
              <Input
                id="walmart-subtext"
                value={trustData.walmart_info.subtext}
                onChange={(e) =>
                  handleWalmartInfoChange("subtext", e.target.value)
                }
                placeholder="Enter subtext..."
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guarantee Info */}
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Guarantee</Badge>
            Guarantee Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guarantee-text">Main Text</Label>
              <Input
                id="guarantee-text"
                value={trustData.guarantee.text}
                onChange={(e) => handleGuaranteeChange("text", e.target.value)}
                placeholder="Enter main text..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="guarantee-subtext">Subtext</Label>
              <Input
                id="guarantee-subtext"
                value={trustData.guarantee.subtext}
                onChange={(e) =>
                  handleGuaranteeChange("subtext", e.target.value)
                }
                placeholder="Enter subtext..."
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Section Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{trustData.title}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Seller Info */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold">{trustData.seller_info.name}</h4>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(trustData.seller_info.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300",
                      )}
                    />
                  ))}
                  <span className="text-sm font-medium ml-1">
                    {trustData.seller_info.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  from {trustData.seller_info.reviews_count} reviews
                </p>
              </div>

              {/* Walmart Info */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold">{trustData.walmart_info.text}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {trustData.walmart_info.subtext}
                </p>
              </div>

              {/* Guarantee */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold">{trustData.guarantee.text}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {trustData.guarantee.subtext}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
