import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Plus,
  Trash2,
  Link as LinkIcon,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { upsertSingletonWithFixedId } from "@/lib/supabase-helpers";

interface TrustElement {
  icon: string;
  text: string;
}

interface OfferPricingData {
  title: string;
  subtitle: string;
  sale_price: number;
  benefits: string[];
  cta_text: string;
  trust_elements: TrustElement[];
  offer_image?: string; // New field for offer image
}

const defaultOfferPricingData: OfferPricingData = {
  title: "Ready to Fuel Your Day?",
  subtitle: "Get your 42-count nutritious snack box today!",
  sale_price: 31.95,
  benefits: [
    "42 premium snacks included",
    "Fresh & high-quality snacks from top brands",
    "Perfect for gifting or office sharing",
    "Fast & reliable delivery nationwide",
    "Greeting card included",
  ],
  cta_text: "Get Your Snack Box Now",
  trust_elements: [
    {
      icon: "Shield",
      text: "Secure Payment",
    },
    {
      icon: "Truck",
      text: "Fast Shipping",
    },
    {
      icon: "BadgeCheck",
      text: "Satisfaction Guaranteed",
    },
  ],
  offer_image: "",
};

export default function OfferPricing() {
  const [offerData, setOfferData] = useState<OfferPricingData>(
    defaultOfferPricingData,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (
    field: keyof OfferPricingData,
    value: string | number,
  ) => {
    setOfferData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `offer-image-${Date.now()}.${fileExt}`;

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

        handleChange("offer_image", publicUrl);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Error uploading image. Please try again.");
      }
    }
  };

  const addBenefit = () => {
    setOfferData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ""],
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setOfferData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) =>
        i === index ? value : benefit,
      ),
    }));
  };

  const removeBenefit = (index: number) => {
    if (offerData.benefits.length > 1) {
      setOfferData((prev) => ({
        ...prev,
        benefits: prev.benefits.filter((_, i) => i !== index),
      }));
    }
  };

  const addTrustElement = () => {
    setOfferData((prev) => ({
      ...prev,
      trust_elements: [...prev.trust_elements, { icon: "Shield", text: "" }],
    }));
  };

  const updateTrustElement = (
    index: number,
    field: "icon" | "text",
    value: string,
  ) => {
    setOfferData((prev) => ({
      ...prev,
      trust_elements: prev.trust_elements.map((element, i) =>
        i === index ? { ...element, [field]: value } : element,
      ),
    }));
  };

  const removeTrustElement = (index: number) => {
    if (offerData.trust_elements.length > 1) {
      setOfferData((prev) => ({
        ...prev,
        trust_elements: prev.trust_elements.filter((_, i) => i !== index),
      }));
    }
  };

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from("offer_pricing")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading data:", error);
        return;
      }

      if (data && data.content) {
        setOfferData(data.content);
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
      const { data, error } = await upsertSingletonWithFixedId(
        "offer_pricing",
        { content: offerData },
      );

      if (error) {
        console.error("Error saving data:", error);
        alert("Error saving Offer/Pricing section. Please try again.");
      } else {
        alert("Offer/Pricing section saved successfully!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving Offer/Pricing section. Please try again.");
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
          Offer / Pricing Section
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
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            Section Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="section-title">Main Title</Label>
              <Input
                id="section-title"
                value={offerData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter main title..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="section-subtitle">Subtitle</Label>
              <Input
                id="section-subtitle"
                value={offerData.subtitle}
                onChange={(e) => handleChange("subtitle", e.target.value)}
                placeholder="Enter subtitle..."
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sale-price">Sale Price ($)</Label>
            <Input
              id="sale-price"
              type="number"
              step="0.01"
              value={offerData.sale_price}
              onChange={(e) =>
                handleChange("sale_price", parseFloat(e.target.value) || 0)
              }
              placeholder="31.95"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cta-text">Call-to-Action Button Text</Label>
            <Input
              id="cta-text"
              value={offerData.cta_text}
              onChange={(e) => handleChange("cta_text", e.target.value)}
              placeholder="Get Your Snack Box Now"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Upload Section */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-green-600" />
            </div>
            Offer Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Upload Custom Offer Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mt-2">
              {offerData.offer_image ? (
                <div className="space-y-4">
                  <img
                    src={offerData.offer_image}
                    alt="Offer preview"
                    className="max-w-full h-48 object-contain mx-auto rounded-lg"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("offer-image-upload")?.click()
                      }
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Replace Image
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChange("offer_image", "")}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Upload Offer Image
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Add a custom image for your offer section
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("offer-image-upload")?.click()
                      }
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Image
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <input
              id="offer-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <div className="mt-3">
              <Label htmlFor="offer-image-url">Or enter image URL</Label>
              <Input
                id="offer-image-url"
                value={offerData.offer_image || ""}
                onChange={(e) => handleChange("offer_image", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Recommended size: 400x300px or similar aspect ratio for best
              display
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card className="border-2 border-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Plus className="w-5 h-5 text-orange-600" />
            </div>
            Product Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <Label>Benefits List</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addBenefit}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Benefit
            </Button>
          </div>
          <div className="space-y-2">
            {offerData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={benefit}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    placeholder="Enter benefit description..."
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeBenefit(index)}
                  disabled={offerData.benefits.length === 1}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust Elements Section */}
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Badge className="w-5 h-5 text-purple-600" />
            </div>
            Trust Elements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <Label>Trust Badges</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addTrustElement}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Trust Element
            </Button>
          </div>
          <div className="space-y-3">
            {offerData.trust_elements.map((element, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-32">
                  <Label className="text-xs">Icon</Label>
                  <select
                    value={element.icon}
                    onChange={(e) =>
                      updateTrustElement(index, "icon", e.target.value)
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Shield">Shield</option>
                    <option value="Truck">Truck</option>
                    <option value="BadgeCheck">Badge Check</option>
                    <option value="Clock">Clock</option>
                    <option value="Star">Star</option>
                    <option value="Award">Award</option>
                  </select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Text</Label>
                  <Input
                    value={element.text}
                    onChange={(e) =>
                      updateTrustElement(index, "text", e.target.value)
                    }
                    placeholder="Enter trust element text..."
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTrustElement(index)}
                  disabled={offerData.trust_elements.length === 1}
                  className="text-red-600 hover:text-red-700 mt-4"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Preview Section */}
      <Card className="border-2 border-indigo-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
            </div>
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-2 text-gray-900">
                {offerData.title}
              </h3>
              <p className="text-gray-600 text-lg">{offerData.subtitle}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
              {/* Product Image */}
              <div className="text-center">
                {offerData.offer_image ? (
                  <img
                    src={offerData.offer_image}
                    alt="Product"
                    className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="w-full max-w-md mx-auto h-64 bg-gray-200 rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                      <p>No image uploaded</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing and Details */}
              <div className="space-y-6">
                {/* Price Display */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      ${offerData.sale_price}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3 mb-6">
                    {offerData.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full py-3 text-lg mb-4" disabled>
                    {offerData.cta_text}
                  </Button>

                  {/* Trust Elements */}
                  <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
                    {offerData.trust_elements.map((element, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <span className="font-medium">{element.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
