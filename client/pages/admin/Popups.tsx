import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  Mail,
  Settings,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { upsertSingletonWithFixedId } from "@/lib/supabase-helpers";
import { usePopups } from "@/hooks/use-popups";

export default function Popups() {
  const {
    productPopupData,
    exitIntentPopupData,
    updateProductPopupData,
    updateExitIntentPopupData,
  } = usePopups();

  const [productData, setProductData] = useState(productPopupData);
  const [exitData, setExitData] = useState(exitIntentPopupData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Product Popup Handlers
  const handleProductChange = (field: string, value: any) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRatingChange = (value: string) => {
    const rating = parseFloat(value);
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      handleProductChange("rating", rating);
    }
  };

  const adjustRating = (increment: number) => {
    const newRating = Math.max(0, Math.min(5, productData.rating + increment));
    handleProductChange("rating", newRating);
  };

  const addFeature = () => {
    setProductData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setProductData((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? value : feature,
      ),
    }));
  };

  const removeFeature = (index: number) => {
    if (productData.features.length > 1) {
      setProductData((prev) => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index),
      }));
    }
  };

  const addDetail = () => {
    setProductData((prev) => ({
      ...prev,
      additional_details: [...prev.additional_details, ""],
    }));
  };

  const updateDetail = (index: number, value: string) => {
    setProductData((prev) => ({
      ...prev,
      additional_details: prev.additional_details.map((detail, i) =>
        i === index ? value : detail,
      ),
    }));
  };

  const removeDetail = (index: number) => {
    if (productData.additional_details.length > 1) {
      setProductData((prev) => ({
        ...prev,
        additional_details: prev.additional_details.filter(
          (_, i) => i !== index,
        ),
      }));
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `popup-image-${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("images")
          .upload(fileName, file);

        if (error) {
          console.error("Upload error:", error);
          alert("Error uploading image. Please try again.");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(fileName);

        handleProductChange("popup_image", publicUrl);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Error uploading image. Please try again.");
      }
    }
  };

  // Exit Intent Popup Handlers
  const handleExitChange = (field: string, value: string) => {
    setExitData((prev) => ({ ...prev, [field]: value }));
  };

  const loadData = async () => {
    try {
      const [productResponse, exitResponse] = await Promise.all([
        supabase.from("product_popup").select("*").single(),
        supabase.from("exit_intent_popup").select("*").single(),
      ]);

      if (productResponse.data && productResponse.data.content) {
        setProductData(productResponse.data.content);
      }

      if (exitResponse.data && exitResponse.data.content) {
        setExitData(exitResponse.data.content);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        upsertSingletonWithFixedId("product_popup", { content: productData }),
        upsertSingletonWithFixedId("exit_intent_popup", { content: exitData }),
      ]);

      // Update context
      updateProductPopupData(productData);
      updateExitIntentPopupData(exitData);

      alert("Popup settings saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving popup settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setProductData(productPopupData);
    setExitData(exitIntentPopupData);
  }, [productPopupData, exitIntentPopupData]);

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
        <h2 className="text-2xl font-bold text-gray-900">Popup Management</h2>
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

      <Tabs defaultValue="product" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Product Details Popup
          </TabsTrigger>
          <TabsTrigger value="exit" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Exit Intent Popup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="product" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details Popup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="product-title">Main Title</Label>
                  <Textarea
                    id="product-title"
                    value={productData.title}
                    onChange={(e) =>
                      handleProductChange("title", e.target.value)
                    }
                    placeholder="Enter popup title..."
                    className="mt-1 min-h-[80px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="product-description">Short Description</Label>
                  <Textarea
                    id="product-description"
                    value={productData.description}
                    onChange={(e) =>
                      handleProductChange("description", e.target.value)
                    }
                    placeholder="Enter popup description..."
                    className="mt-1 min-h-[60px]"
                  />
                </div>

                <div>
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={productData.product_name}
                    onChange={(e) =>
                      handleProductChange("product_name", e.target.value)
                    }
                    placeholder="Enter product name..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="pieces-count">Pieces Count</Label>
                  <Input
                    id="pieces-count"
                    type="number"
                    value={productData.pieces_count}
                    onChange={(e) =>
                      handleProductChange(
                        "pieces_count",
                        parseInt(e.target.value),
                      )
                    }
                    placeholder="42"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Rating Section */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Label className="text-sm font-medium text-yellow-800 mb-3 block">
                  Star Rating & Reviews
                </Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating Value</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={productData.rating}
                        onChange={(e) => handleRatingChange(e.target.value)}
                        className="w-20"
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustRating(-0.1)}
                          disabled={productData.rating <= 0}
                        >
                          -
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adjustRating(0.1)}
                          disabled={productData.rating >= 5}
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
                      value={productData.reviews_count}
                      onChange={(e) =>
                        handleProductChange(
                          "reviews_count",
                          parseInt(e.target.value),
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < Math.floor(productData.rating)
                            ? "text-yellow-400 fill-current"
                            : i < productData.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary">
                    {productData.rating.toFixed(1)} ⭐ (
                    {productData.reviews_count} reviews)
                  </Badge>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <Label htmlFor="original-price">Original Price ($)</Label>
                  <Input
                    id="original-price"
                    type="number"
                    step="0.01"
                    value={productData.original_price}
                    onChange={(e) =>
                      handleProductChange(
                        "original_price",
                        parseFloat(e.target.value),
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="discounted-price">Discounted Price ($)</Label>
                  <Input
                    id="discounted-price"
                    type="number"
                    step="0.01"
                    value={productData.discounted_price}
                    onChange={(e) =>
                      handleProductChange(
                        "discounted_price",
                        parseFloat(e.target.value),
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2 mt-2">
                  <p className="text-sm font-medium">Preview:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 line-through">
                      ${productData.original_price.toFixed(2)}
                    </span>
                    <span className="text-green-600 font-bold text-lg">
                      ${productData.discounted_price.toFixed(2)}
                    </span>
                    <Badge variant="secondary">
                      Save $
                      {(
                        productData.original_price -
                        productData.discounted_price
                      ).toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Product Features</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Feature
                  </Button>
                </div>
                <div className="space-y-2">
                  {productData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Enter feature..."
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        disabled={productData.features.length === 1}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Additional Details</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addDetail}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Detail
                  </Button>
                </div>
                <div className="space-y-2">
                  {productData.additional_details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Textarea
                        value={detail}
                        onChange={(e) => updateDetail(index, e.target.value)}
                        placeholder="Enter additional detail..."
                        className="flex-1 min-h-[60px]"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDetail(index)}
                        disabled={productData.additional_details.length === 1}
                        className="text-red-600 mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label>Popup Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1">
                  {productData.popup_image ? (
                    <div className="space-y-3">
                      <img
                        src={productData.popup_image}
                        alt="Popup preview"
                        className="max-w-full h-32 object-contain mx-auto rounded"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById("popup-image-upload")
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
                          onClick={() => handleProductChange("popup_image", "")}
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
                          document.getElementById("popup-image-upload")?.click()
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
                  id="popup-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="mt-2">
                  <Input
                    value={productData.popup_image}
                    onChange={(e) =>
                      handleProductChange("popup_image", e.target.value)
                    }
                    placeholder="Or enter image URL..."
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exit Intent Popup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Content */}
              <div>
                <Label htmlFor="exit-title">Title</Label>
                <Input
                  id="exit-title"
                  value={exitData.title}
                  onChange={(e) => handleExitChange("title", e.target.value)}
                  placeholder="Enter popup title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="exit-description">Description</Label>
                <Textarea
                  id="exit-description"
                  value={exitData.description}
                  onChange={(e) =>
                    handleExitChange("description", e.target.value)
                  }
                  placeholder="Enter popup description..."
                  className="mt-1 min-h-[100px]"
                />
              </div>

              {/* Interactive Elements */}
              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email-placeholder">Email Placeholder</Label>
                  <Input
                    id="email-placeholder"
                    value={exitData.email_placeholder}
                    onChange={(e) =>
                      handleExitChange("email_placeholder", e.target.value)
                    }
                    placeholder="Enter email placeholder..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subscribe-button">
                    Subscribe Button Text
                  </Label>
                  <Input
                    id="subscribe-button"
                    value={exitData.subscribe_button_text}
                    onChange={(e) =>
                      handleExitChange("subscribe_button_text", e.target.value)
                    }
                    placeholder="Enter button text..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dismiss-button">Dismiss Button Text</Label>
                  <Input
                    id="dismiss-button"
                    value={exitData.dismiss_button_text}
                    onChange={(e) =>
                      handleExitChange("dismiss_button_text", e.target.value)
                    }
                    placeholder="Enter dismiss text..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="privacy-note">Privacy Note</Label>
                  <Input
                    id="privacy-note"
                    value={exitData.privacy_note}
                    onChange={(e) =>
                      handleExitChange("privacy_note", e.target.value)
                    }
                    placeholder="Enter privacy note..."
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Email Configuration */}
              <Separator />

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Label className="text-sm font-medium text-blue-800 mb-3 block">
                  Email Configuration
                </Label>
                <div>
                  <Label htmlFor="destination-email">Destination Email</Label>
                  <Input
                    id="destination-email"
                    type="email"
                    value={exitData.destination_email}
                    onChange={(e) =>
                      handleExitChange("destination_email", e.target.value)
                    }
                    placeholder="admin@yourdomain.com"
                    className="mt-1"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Email address where subscriptions will be sent
                  </p>
                </div>
              </div>

              {/* Marketing Integrations */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Label className="text-sm font-medium text-gray-800 mb-3 block">
                  Marketing Integrations (Optional)
                </Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mailchimp-api">Mailchimp API Key</Label>
                    <Input
                      id="mailchimp-api"
                      value={exitData.mailchimp_api_key}
                      onChange={(e) =>
                        handleExitChange("mailchimp_api_key", e.target.value)
                      }
                      placeholder="Enter Mailchimp API key..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mailchimp-list">Mailchimp List ID</Label>
                    <Input
                      id="mailchimp-list"
                      value={exitData.mailchimp_list_id}
                      onChange={(e) =>
                        handleExitChange("mailchimp_list_id", e.target.value)
                      }
                      placeholder="Enter list ID..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brevo-api">Brevo API Key</Label>
                    <Input
                      id="brevo-api"
                      value={exitData.brevo_api_key}
                      onChange={(e) =>
                        handleExitChange("brevo_api_key", e.target.value)
                      }
                      placeholder="Enter Brevo API key..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brevo-list">Brevo List ID</Label>
                    <Input
                      id="brevo-list"
                      value={exitData.brevo_list_id}
                      onChange={(e) =>
                        handleExitChange("brevo_list_id", e.target.value)
                      }
                      placeholder="Enter list ID..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Label className="text-sm font-medium text-purple-800 mb-3 block">
                  Popup Preview
                </Label>
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200 max-w-md mx-auto">
                  <h3 className="text-lg font-bold mb-2">{exitData.title}</h3>
                  <div className="text-sm text-gray-600 mb-4 whitespace-pre-line">
                    {exitData.description}
                  </div>
                  <Input
                    placeholder={exitData.email_placeholder}
                    className="mb-3"
                    disabled
                  />
                  <div className="flex gap-2">
                    <Button className="flex-1" disabled>
                      {exitData.subscribe_button_text}
                    </Button>
                    <Button variant="outline" disabled>
                      {exitData.dismiss_button_text}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {exitData.privacy_note}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
