import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Search,
  Share2,
  Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { upsertSingletonWithFixedId } from "@/lib/supabase-helpers";
import { useSEO } from "@/hooks/use-seo";
import { logError } from "@/lib/error-utils";

interface SEOData {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  facebook_pixel_id: string;
}

export default function SEO() {
  const { seoData: contextSeoData, updateSEOData } = useSEO();
  const [seoData, setSeoData] = useState<SEOData>(contextSeoData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (field: keyof SEOData, value: string) => {
    setSeoData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `og-image-${Date.now()}.${fileExt}`;

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

        handleChange("og_image", publicUrl);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Error uploading image. Please try again.");
      }
    }
  };

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading data:", error);
        return;
      }

      if (data && data.content) {
        setSeoData(data.content);
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
      const { data, error } = await upsertSingletonWithFixedId("seo_settings", {
        content: seoData,
      });

      if (error) {
        console.error("Error saving data:", error);
        alert("Error saving SEO settings. Please try again.");
      } else {
        // Update the context to apply changes immediately
        updateSEOData(seoData);
        alert(
          "SEO settings saved successfully! Changes are now live on your website.",
        );
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving SEO settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getCharacterCount = (text: string, limit: number) => {
    const count = text.length;
    const isOverLimit = count > limit;
    return {
      count,
      isOverLimit,
      remaining: limit - count,
    };
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSeoData(contextSeoData);
  }, [contextSeoData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const titleCount = getCharacterCount(seoData.meta_title, 60);
  const descriptionCount = getCharacterCount(seoData.meta_description, 160);
  const ogTitleCount = getCharacterCount(seoData.og_title, 95);
  const ogDescriptionCount = getCharacterCount(seoData.og_description, 300);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          SEO & Tracking Settings
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
        {/* Left Column - SEO Settings */}
        <div className="space-y-6">
          {/* Basic Meta Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Basic SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={seoData.meta_title}
                  onChange={(e) => handleChange("meta_title", e.target.value)}
                  placeholder="Enter meta title..."
                  className={`mt-1 ${titleCount.isOverLimit ? "border-red-300" : ""}`}
                />
                <p
                  className={`text-xs mt-1 ${titleCount.isOverLimit ? "text-red-600" : "text-gray-500"}`}
                >
                  {titleCount.count}/60 characters{" "}
                  {titleCount.isOverLimit && "(Too long for optimal SEO)"}
                </p>
              </div>

              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={seoData.meta_description}
                  onChange={(e) =>
                    handleChange("meta_description", e.target.value)
                  }
                  placeholder="Enter meta description..."
                  className={`mt-1 min-h-[80px] ${descriptionCount.isOverLimit ? "border-red-300" : ""}`}
                />
                <p
                  className={`text-xs mt-1 ${descriptionCount.isOverLimit ? "text-red-600" : "text-gray-500"}`}
                >
                  {descriptionCount.count}/160 characters{" "}
                  {descriptionCount.isOverLimit && "(Too long for optimal SEO)"}
                </p>
              </div>

              <div>
                <Label htmlFor="meta-keywords">Meta Keywords</Label>
                <Input
                  id="meta-keywords"
                  value={seoData.meta_keywords}
                  onChange={(e) =>
                    handleChange("meta_keywords", e.target.value)
                  }
                  placeholder="keyword1, keyword2, keyword3..."
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate keywords with commas
                </p>
              </div>

              <div>
                <Label htmlFor="canonical-url">Canonical URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="canonical-url"
                    value={seoData.canonical_url}
                    onChange={(e) =>
                      handleChange("canonical_url", e.target.value)
                    }
                    placeholder="https://yourdomain.com/page"
                    className={`flex-1 ${seoData.canonical_url && !validateUrl(seoData.canonical_url) ? "border-red-300" : ""}`}
                  />
                  {seoData.canonical_url &&
                    validateUrl(seoData.canonical_url) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(seoData.canonical_url, "_blank")
                        }
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                </div>
                {seoData.canonical_url &&
                  !validateUrl(seoData.canonical_url) && (
                    <p className="text-xs text-red-600 mt-1">
                      Please enter a valid URL
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Open Graph Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Social Media (Open Graph)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="og-title">OG Title</Label>
                <Input
                  id="og-title"
                  value={seoData.og_title}
                  onChange={(e) => handleChange("og_title", e.target.value)}
                  placeholder="Enter Open Graph title..."
                  className={`mt-1 ${ogTitleCount.isOverLimit ? "border-red-300" : ""}`}
                />
                <p
                  className={`text-xs mt-1 ${ogTitleCount.isOverLimit ? "text-red-600" : "text-gray-500"}`}
                >
                  {ogTitleCount.count}/95 characters{" "}
                  {ogTitleCount.isOverLimit && "(Too long for social media)"}
                </p>
              </div>

              <div>
                <Label htmlFor="og-description">OG Description</Label>
                <Textarea
                  id="og-description"
                  value={seoData.og_description}
                  onChange={(e) =>
                    handleChange("og_description", e.target.value)
                  }
                  placeholder="Enter Open Graph description..."
                  className={`mt-1 min-h-[80px] ${ogDescriptionCount.isOverLimit ? "border-red-300" : ""}`}
                />
                <p
                  className={`text-xs mt-1 ${ogDescriptionCount.isOverLimit ? "text-red-600" : "text-gray-500"}`}
                >
                  {ogDescriptionCount.count}/300 characters{" "}
                  {ogDescriptionCount.isOverLimit &&
                    "(Too long for social media)"}
                </p>
              </div>

              <div>
                <Label>OG Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1">
                  {seoData.og_image ? (
                    <div className="space-y-3">
                      <img
                        src={seoData.og_image}
                        alt="OG Image preview"
                        className="max-w-full h-32 object-contain mx-auto rounded"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("og-image-upload")?.click()
                          }
                          className="flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          Replace
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChange("og_image", "")}
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
                          document.getElementById("og-image-upload")?.click()
                        }
                        className="flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Upload OG Image
                      </Button>
                    </div>
                  )}
                </div>

                <input
                  id="og-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="mt-2">
                  <Input
                    value={seoData.og_image}
                    onChange={(e) => handleChange("og_image", e.target.value)}
                    placeholder="Or enter image URL... (Recommended: 1200x630px)"
                    className="text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 1200x630px for optimal social media display
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tracking & Preview */}
        <div className="space-y-6">
          {/* Tracking Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Tracking & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
                <Input
                  id="facebook-pixel"
                  value={seoData.facebook_pixel_id}
                  onChange={(e) =>
                    handleChange("facebook_pixel_id", e.target.value)
                  }
                  placeholder="Enter Facebook Pixel ID..."
                  className="mt-1"
                />
                {seoData.facebook_pixel_id && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      ✅ Facebook Pixel Active
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Pixel ID: {seoData.facebook_pixel_id}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  When you save this, the Facebook Pixel will automatically
                  start tracking on your website
                </p>
              </div>

              <Separator />

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Future Integrations
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    Google Analytics (Coming Soon)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    TikTok Pixel (Coming Soon)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    Google Tag Manager (Coming Soon)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Search Engine Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Google Search Result Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-3">
                    Google Search Result Preview:
                  </p>
                  <div className="space-y-1">
                    <h3 className="text-lg text-blue-600 font-medium cursor-pointer hover:underline line-clamp-1">
                      {seoData.meta_title || "Your Page Title"}
                    </h3>
                    <p className="text-sm text-green-700">
                      {seoData.canonical_url || "https://yourdomain.com"}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {seoData.meta_description ||
                        "Your meta description will appear here..."}
                    </p>
                  </div>
                </div>

                {/* Social Media Preview */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-3">
                    Social Media Preview:
                  </p>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {seoData.og_image && (
                      <img
                        src={seoData.og_image}
                        alt="Social preview"
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {seoData.og_title || "Your OG Title"}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {seoData.og_description ||
                          "Your OG description will appear here..."}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {seoData.canonical_url || "yourdomain.com"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
