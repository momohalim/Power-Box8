import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Save, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { upsertSingletonWithFixedId } from "@/lib/supabase-helpers";
import { useRealTimeSync } from "@/hooks/use-data-sync";
import { logDatabaseError } from "@/lib/error-handler";
import { uploadImageToSupabase } from "@/lib/imageUpload";
import {
  showUploadSuccess,
  showUploadError,
  showSaveSuccess,
  showSaveError,
} from "@/lib/notifications";

interface CustomerReview {
  name: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  image?: string; // URL for customer profile image
}

interface CustomerReviewsData {
  title: string;
  overall_rating: number;
  total_reviews: number;
  reviews: CustomerReview[];
}

const defaultCustomerReviewsData: CustomerReviewsData = {
  title: "What Our Customers Say",
  overall_rating: 4.6,
  total_reviews: 27,
  reviews: [
    {
      name: "Sarah M.",
      rating: 5,
      text: "Amazing variety! Perfect for our office team. Everyone loved the selection of snacks.",
      date: "2 weeks ago",
      verified: true,
      image: "",
    },
    {
      name: "Mike D.",
      rating: 5,
      text: "Great gift idea! Sent this to my college son and he was thrilled with all the different snacks.",
      date: "1 month ago",
      verified: true,
      image: "",
    },
    {
      name: "Lisa K.",
      rating: 4,
      text: "Good quality snacks and fast delivery. Would definitely order again.",
      date: "3 weeks ago",
      verified: true,
      image: "",
    },
    {
      name: "James T.",
      rating: 5,
      text: "Excellent quality and presentation. The packaging is beautiful and the snacks are fresh and delicious.",
      date: "1 week ago",
      verified: true,
      image: "",
    },
    {
      name: "Emily R.",
      rating: 5,
      text: "Perfect for our company break room! Everyone keeps asking where we got these amazing snacks.",
      date: "5 days ago",
      verified: true,
      image: "",
    },
    {
      name: "David C.",
      rating: 4,
      text: "Great variety and fast shipping. My kids love the breakfast bars and I enjoy the healthier options.",
      date: "4 days ago",
      verified: true,
      image: "",
    },
  ],
};

export default function Testimonials() {
  const [reviewsData, setReviewsData] = useState<CustomerReviewsData>(
    defaultCustomerReviewsData,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set up real-time sync
  useRealTimeSync("customer_reviews", (payload) => {
    console.log("🔄 Customer reviews updated via real-time:", payload);
    if (payload.new && payload.new.content) {
      setReviewsData(payload.new.content);
    }
  });

  const handleTitleChange = (value: string) => {
    setReviewsData((prev) => ({ ...prev, title: value }));
  };

  const handleOverallRatingChange = (value: string) => {
    const rating = parseFloat(value);
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      setReviewsData((prev) => ({ ...prev, overall_rating: rating }));
    }
  };

  const handleTotalReviewsChange = (value: string) => {
    const total = parseInt(value);
    if (!isNaN(total) && total >= 0) {
      setReviewsData((prev) => ({ ...prev, total_reviews: total }));
    }
  };

  const handleReviewChange = (
    index: number,
    field: keyof CustomerReview,
    value: string | number,
  ) => {
    setReviewsData((prev) => ({
      ...prev,
      reviews: prev.reviews.map((review, i) =>
        i === index ? { ...review, [field]: value } : review,
      ),
    }));
  };

  const handleRatingChange = (index: number, value: string) => {
    const rating = parseInt(value);
    if (!isNaN(rating) && rating >= 1 && rating <= 5) {
      handleReviewChange(index, "rating", rating);
    }
  };

  const adjustRating = (index: number, increment: number) => {
    const currentRating = reviewsData.reviews[index].rating;
    const newRating = Math.max(1, Math.min(5, currentRating + increment));
    handleReviewChange(index, "rating", newRating);
  };

  // Image upload functionality for customer review profile photos
  const handleImageUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const originalImage = reviewsData.reviews[index].image || "";

      try {
        // Show loading state with temporary preview
        const tempUrl = URL.createObjectURL(file);
        handleReviewChange(index, "image", tempUrl);

        // Upload using enhanced utility with customer_reviews bucket
        const result = await uploadImageToSupabase(file, "customer_reviews");

        if (result.success && result.url) {
          // Update with actual Supabase URL
          handleReviewChange(index, "image", result.url);

          // Clean up temporary URL
          URL.revokeObjectURL(tempUrl);

          // Show success notification
          showUploadSuccess(`Review ${index + 1} image`);
        } else {
          // Revert to original image on error
          handleReviewChange(index, "image", originalImage);
          URL.revokeObjectURL(tempUrl);

          // Show specific error message
          showUploadError(
            result.error || "Failed to upload image",
            `Review ${index + 1} image`,
          );
        }
      } catch (error) {
        // Revert to original image on error
        handleReviewChange(index, "image", originalImage);
        console.error("Image upload failed:", error);
        showUploadError(
          "Unexpected error during image upload. Please try again.",
          `Review ${index + 1} image`,
        );
      }
    }
  };

  const handleImageUrlChange = (index: number, url: string) => {
    handleReviewChange(index, "image", url);
  };

  const handleRemoveImage = (index: number) => {
    handleReviewChange(index, "image", "");
  };

  const adjustOverallRating = (increment: number) => {
    const newRating = Math.max(
      0,
      Math.min(5, reviewsData.overall_rating + increment),
    );
    setReviewsData((prev) => ({ ...prev, overall_rating: newRating }));
  };

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from("customer_reviews")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.info("Customer reviews table not found, using default data");
        } else {
          logDatabaseError("Error loading customer reviews data", error);
        }
        setReviewsData(defaultCustomerReviewsData);
        return;
      }

      if (data && data.content) {
        setReviewsData(data.content);
      } else {
        setReviewsData(defaultCustomerReviewsData);
      }
    } catch (error) {
      logDatabaseError("Catch block - customer reviews error", error);
      console.info(
        "Using default customer reviews data due to database connection issue",
      );
      setReviewsData(defaultCustomerReviewsData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await upsertSingletonWithFixedId(
        "customer_reviews",
        { content: reviewsData },
      );

      if (error) {
        if (error.code === "42P01" || error.code === "PGRST116") {
          alert(
            "Database tables not set up yet. Please run the setup script first.",
          );
          return;
        }
        logDatabaseError("Error saving customer reviews", error);
        showSaveError(
          "Error saving Customer Reviews section. Please try again.",
          "Customer Reviews",
        );
      } else {
        // Show success notification
        showSaveSuccess("Customer Reviews section");
      }
    } catch (error) {
      logDatabaseError("Catch block - saving customer reviews error", error);
      showSaveError(
        "Error saving Customer Reviews section. Please try again.",
        "Customer Reviews",
      );
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
          Customer Reviews Section
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

      {/* Section Headers */}
      <Card>
        <CardHeader>
          <CardTitle>Section Headers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="section-title">Main Title</Label>
            <Input
              id="section-title"
              value={reviewsData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter main title..."
              className="mt-1"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="overall-rating">Overall Rating</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="overall-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={reviewsData.overall_rating}
                  onChange={(e) => handleOverallRatingChange(e.target.value)}
                  className="w-24"
                />
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustOverallRating(-0.1)}
                    disabled={reviewsData.overall_rating <= 0}
                  >
                    -
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustOverallRating(0.1)}
                    disabled={reviewsData.overall_rating >= 5}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="total-reviews">Total Reviews</Label>
              <Input
                id="total-reviews"
                type="number"
                min="0"
                value={reviewsData.total_reviews}
                onChange={(e) => handleTotalReviewsChange(e.target.value)}
                placeholder="Total number of reviews..."
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Reviews */}
      <div className="grid lg:grid-cols-2 gap-6">
        {reviewsData.reviews.map((review, index) => (
          <Card key={index} className="border-2 border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Review {index + 1}</Badge>
                {review.name || "Unnamed Customer"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Name */}
              <div>
                <Label htmlFor={`review-name-${index}`}>Customer Name</Label>
                <Input
                  id={`review-name-${index}`}
                  value={review.name}
                  onChange={(e) =>
                    handleReviewChange(index, "name", e.target.value)
                  }
                  placeholder="Enter customer name..."
                  className="mt-1"
                />
              </div>

              {/* Review Date */}
              <div>
                <Label htmlFor={`review-date-${index}`}>Review Date</Label>
                <Input
                  id={`review-date-${index}`}
                  value={review.date}
                  onChange={(e) =>
                    handleReviewChange(index, "date", e.target.value)
                  }
                  placeholder="e.g., '2 weeks ago'..."
                  className="mt-1"
                />
              </div>

              {/* Verified Status */}
              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id={`verified-${index}`}
                  checked={review.verified}
                  onChange={(e) =>
                    handleReviewChange(index, "verified", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor={`verified-${index}`}>Verified Purchase</Label>
              </div>

              {/* Star Rating */}
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label className="text-sm font-medium text-yellow-800">
                  Star Rating
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      step="1"
                      value={review.rating}
                      onChange={(e) =>
                        handleRatingChange(index, e.target.value)
                      }
                      className="w-16"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustRating(index, -1)}
                      disabled={review.rating <= 1}
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustRating(index, 1)}
                      disabled={review.rating >= 5}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Star Display */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary">{review.rating} stars</Badge>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <Label htmlFor={`review-text-${index}`}>Review Text</Label>
                <Textarea
                  id={`review-text-${index}`}
                  value={review.text}
                  onChange={(e) =>
                    handleReviewChange(index, "text", e.target.value)
                  }
                  placeholder="Enter customer review..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              {/* Customer Profile Image Upload */}
              <div className="space-y-4">
                <Label>Customer Profile Image</Label>

                {/* Image Preview and Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {review.image ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <img
                          src={review.image}
                          alt={`${review.name} profile`}
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById(`image-upload-${index}`)
                              ?.click()
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Replace
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-600 text-sm">
                          No image uploaded
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById(`image-upload-${index}`)
                              ?.click()
                          }
                          className="mt-2"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  id={`image-upload-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e)}
                  className="hidden"
                />

                {/* URL input as alternative */}
                <div>
                  <Label htmlFor={`image-url-${index}`}>
                    Or enter image URL:
                  </Label>
                  <Input
                    id={`image-url-${index}`}
                    value={review.image || ""}
                    onChange={(e) =>
                      handleImageUrlChange(index, e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
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
          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="text-xl font-bold mb-2">{reviewsData.title}</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(reviewsData.overall_rating)
                        ? "text-yellow-400 fill-current"
                        : i < reviewsData.overall_rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300",
                    )}
                  />
                ))}
              </div>
              <Badge variant="secondary">
                {reviewsData.overall_rating.toFixed(1)} from{" "}
                {reviewsData.total_reviews} reviews
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {reviewsData.reviews.slice(0, 4).map((review, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <strong className="text-sm">{review.name}</strong>
                    {review.verified && (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300",
                        )}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      {review.date}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
