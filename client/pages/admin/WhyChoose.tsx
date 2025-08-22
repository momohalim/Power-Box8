import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { upsertSingletonWithFixedId } from "@/lib/supabase-helpers";
import { logError } from "@/lib/error-utils";
import { uploadImageToSupabase } from "@/lib/imageUpload";

interface Benefit {
  title: string;
  description: string;
  color: string;
  image: string;
}

interface WhyChooseData {
  title: string;
  benefits: Benefit[];
}

const defaultWhyChooseData: WhyChooseData = {
  title: "Why Choose Our Nutritious Snack Box?",
  benefits: [
    {
      title: "Variety of Snacks",
      description:
        "Perfect mix of breakfast bars and savory snacks for any time of day",
      color: "blue",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F79b7dfd5cb0f4ca0b96e836c27c6ef40%2F4d9abe9f679440fcb3470285697707f4?format=webp&width=800",
    },
    {
      title: "High-End Packaging",
      description:
        "Attractive and professional packaging that makes a great impression",
      color: "purple",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F79b7dfd5cb0f4ca0b96e836c27c6ef40%2F6305c43f8b6449fc8926c50b002e25fe?format=webp&width=800",
    },
    {
      title: "Grab-and-Go Convenience",
      description: "Individually packaged snacks perfect for busy lifestyles",
      color: "green",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F79b7dfd5cb0f4ca0b96e836c27c6ef40%2F26b950db7e9644baa7113c5a0046d0fa?format=webp&width=800",
    },
    {
      title: "Suitable for All Ages",
      description: "Perfect for adults, teens, and college students alike",
      color: "orange",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F79b7dfd5cb0f4ca0b96e836c27c6ef40%2Fa7c068e933744309b8f41ed0726156a2?format=webp&width=800",
    },
    {
      title: "Heartwarming Greeting Card",
      description: "Comes with a special greeting card to show you care",
      color: "red",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F79b7dfd5cb0f4ca0b96e836c27c6ef40%2F19d8d6717d2a4dc6b633c9494573527a?format=webp&width=800",
    },
    {
      title: "42 Count Value",
      description: "Generous quantity ensuring lasting satisfaction and value",
      color: "indigo",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2F79b7dfd5cb0f4ca0b96e836c27c6ef40%2F74bff8b15ba640b1acf1428f6b9b71b9?format=webp&width=800",
    },
  ],
};

export default function WhyChoose() {
  const [whyChooseData, setWhyChooseData] =
    useState<WhyChooseData>(defaultWhyChooseData);
  const [isSaving, setIsSaving] = useState(false);

  const handleTitleChange = (value: string) => {
    setWhyChooseData((prev) => ({ ...prev, title: value }));
  };

  const handleBenefitChange = (
    index: number,
    field: keyof Benefit,
    value: string,
  ) => {
    setWhyChooseData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) =>
        i === index ? { ...benefit, [field]: value } : benefit,
      ),
    }));
  };

  const handleImageUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const originalImage = whyChooseData.benefits[index].image;

      try {
        // Show loading state with temporary preview
        const tempUrl = URL.createObjectURL(file);
        handleBenefitChange(index, "image", tempUrl);

        // Upload using enhanced utility
        const result = await uploadImageToSupabase(
          file,
          "why-choose",
          `benefit-${index}-${Date.now()}`,
        );

        if (result.success && result.url) {
          // Update with actual Supabase URL
          handleBenefitChange(index, "image", result.url);

          // Clean up temporary URL
          URL.revokeObjectURL(tempUrl);

          // Show success notification
          const notification = document.createElement("div");
          notification.className =
            "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
          notification.textContent = `Benefit ${index + 1} image uploaded successfully!`;
          document.body.appendChild(notification);

          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 3000);
        } else {
          // Revert to original image on error
          handleBenefitChange(index, "image", originalImage);
          URL.revokeObjectURL(tempUrl);

          // Show specific error message
          alert(result.error || "Failed to upload image");
        }
      } catch (error) {
        // Revert to original image on error
        handleBenefitChange(index, "image", originalImage);
        console.error("Image upload failed:", error);
        alert("Unexpected error during image upload. Please try again.");
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("Saving why choose data:", whyChooseData);

      const { data, error } = await upsertSingletonWithFixedId(
        "why_choose_section",
        { content: whyChooseData },
      );

      if (error) {
        if (error.code === "42P01") {
          alert(
            "Database tables not set up yet. Please run the setup script first.",
          );
          return;
        }
        throw error;
      }

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
      notification.textContent = "Why Choose section saved and synced!";
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error("Error saving why choose data:", error);
      alert("Error saving Why Choose section. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from("why_choose_section")
          .select("*")
          .single();

        if (error && error.code !== "PGRST116") {
          logError("Error loading data:", error);
          return;
        }

        if (data && data.content) {
          setWhyChooseData(data.content);
        }
      } catch (error) {
        logError("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Why Choose Section Management
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
            value={whyChooseData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter section title..."
            className="text-lg"
          />
        </CardContent>
      </Card>

      {/* Benefits Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {whyChooseData.benefits.map((benefit, index) => (
          <Card key={index} className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Benefit {index + 1}</Badge>
                {benefit.title || "Untitled Benefit"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Benefit Title */}
              <div>
                <Label htmlFor={`benefit-title-${index}`}>Title</Label>
                <Input
                  id={`benefit-title-${index}`}
                  value={benefit.title}
                  onChange={(e) =>
                    handleBenefitChange(index, "title", e.target.value)
                  }
                  placeholder="Enter benefit title..."
                  className="mt-1"
                />
              </div>

              {/* Benefit Description */}
              <div>
                <Label htmlFor={`benefit-desc-${index}`}>Description</Label>
                <Textarea
                  id={`benefit-desc-${index}`}
                  value={benefit.description}
                  onChange={(e) =>
                    handleBenefitChange(index, "description", e.target.value)
                  }
                  placeholder="Enter benefit description..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              {/* Color Selection */}
              <div>
                <Label htmlFor={`benefit-color-${index}`}>Color Theme</Label>
                <select
                  id={`benefit-color-${index}`}
                  value={benefit.color}
                  onChange={(e) =>
                    handleBenefitChange(index, "color", e.target.value)
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                  <option value="green">Green</option>
                  <option value="orange">Orange</option>
                  <option value="red">Red</option>
                  <option value="indigo">Indigo</option>
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Preview:</span>
                  <div
                    className={`w-4 h-4 rounded ${
                      benefit.color === "blue"
                        ? "bg-blue-600"
                        : benefit.color === "purple"
                          ? "bg-purple-600"
                          : benefit.color === "green"
                            ? "bg-green-600"
                            : benefit.color === "orange"
                              ? "bg-orange-600"
                              : benefit.color === "red"
                                ? "bg-red-600"
                                : "bg-indigo-600"
                    }`}
                  />
                </div>
              </div>

              {/* Image Upload/URL */}
              <div>
                <Label>Benefit Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1">
                  {benefit.image ? (
                    <div className="space-y-2">
                      <img
                        src={benefit.image}
                        alt="Benefit preview"
                        className="max-w-full h-24 object-contain mx-auto rounded"
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
                          onClick={() =>
                            handleBenefitChange(index, "image", "")
                          }
                          className="text-red-600"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
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
                  <Input
                    value={benefit.image}
                    onChange={(e) =>
                      handleBenefitChange(index, "image", e.target.value)
                    }
                    placeholder="Or enter image URL..."
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
