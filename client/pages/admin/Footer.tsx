import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { upsertSingletonWithFixedId } from "@/lib/supabase-helpers";
import { logError } from "@/lib/error-utils";

interface FooterData {
  social_links: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
}

const defaultFooterData: FooterData = {
  social_links: {
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    tiktok: "",
  },
};

const socialPlatforms = [
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "text-blue-600",
    placeholder: "https://facebook.com/yourpage",
  },
  {
    key: "twitter",
    label: "Twitter",
    icon: Twitter,
    color: "text-blue-400",
    placeholder: "https://twitter.com/yourhandle",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "text-pink-600",
    placeholder: "https://instagram.com/yourhandle",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "text-red-600",
    placeholder: "https://youtube.com/yourchannel",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
      </svg>
    ),
    color: "text-black",
    placeholder: "https://tiktok.com/@yourhandle",
  },
];

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFooterData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from("footer")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        logError("Error loading data:", error);
        return;
      }

      if (data && data.content) {
        setFooterData(data.content);
      }
    } catch (error) {
      logError("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await upsertSingletonWithFixedId("footer", {
        content: footerData,
      });

      if (error) {
        logError("Error saving data:", error);
        alert("Error saving Footer section. Please try again.");
      } else {
        alert("Footer section saved successfully!");
      }
    } catch (error) {
      logError("Error saving data:", error);
      alert("Error saving Footer section. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Empty URLs are allowed
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getActivePlatforms = () => {
    return socialPlatforms.filter(
      (platform) =>
        footerData.social_links[
          platform.key as keyof typeof footerData.social_links
        ],
    );
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
          Footer (Social Links) Section
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

      {/* Social Links Configuration */}
      <div className="grid md:grid-cols-2 gap-6">
        {socialPlatforms.map((platform) => {
          const IconComponent = platform.icon;
          const currentValue =
            footerData.social_links[
              platform.key as keyof typeof footerData.social_links
            ];
          const isValidUrl = validateUrl(currentValue);

          return (
            <Card
              key={platform.key}
              className="border-2 border-gray-100 hover:border-gray-200 transition-colors"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-gray-50 ${platform.color}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-lg">{platform.label}</span>
                    {currentValue && (
                      <Badge
                        variant={isValidUrl ? "secondary" : "destructive"}
                        className="ml-2"
                      >
                        {isValidUrl ? "Active" : "Invalid URL"}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor={`social-${platform.key}`}>Platform URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id={`social-${platform.key}`}
                      value={currentValue}
                      onChange={(e) =>
                        handleSocialLinkChange(platform.key, e.target.value)
                      }
                      placeholder={platform.placeholder}
                      className={`flex-1 ${!isValidUrl && currentValue ? "border-red-300 focus:border-red-500" : ""}`}
                    />
                    {currentValue && isValidUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(currentValue, "_blank")}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Test
                      </Button>
                    )}
                  </div>
                  {!isValidUrl && currentValue && (
                    <p className="text-sm text-red-600 mt-1">
                      Please enter a valid URL
                    </p>
                  )}
                </div>

                {currentValue && isValidUrl && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${platform.color}`} />
                      <span className="text-sm font-medium">
                        {platform.label}
                      </span>
                      <span className="text-xs text-gray-500">→</span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {currentValue}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Links Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Active Social Links Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {getActivePlatforms().length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                {getActivePlatforms().length} social platform
                {getActivePlatforms().length !== 1 ? "s" : ""} configured
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {getActivePlatforms().map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <div
                      key={platform.key}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <IconComponent className={`w-4 h-4 ${platform.color}`} />
                      <span className="text-sm font-medium">
                        {platform.label}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ExternalLink className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No social links configured</p>
              <p className="text-sm text-gray-400">
                Add social media URLs above to connect with your audience
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="flex flex-wrap justify-center items-center gap-6">
              {getActivePlatforms().length > 0 ? (
                getActivePlatforms().map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <div
                      key={platform.key}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <IconComponent className="w-8 h-8" />
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400 text-sm">
                  No social links to display
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
