import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
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

interface SEOContextType {
  seoData: SEOData;
  updateSEOData: (data: Partial<SEOData>) => void;
  isLoading: boolean;
}

const defaultSEOData: SEOData = {
  meta_title:
    "Nutritious Snack Box with Breakfast Bars and Delicious Chips | Gift A Snack (42 Count)",
  meta_description:
    "Get your 42-count nutritious snack box with breakfast bars and delicious chips. Perfect for gifting, office sharing, or personal enjoyment. Fast delivery, high-quality snacks.",
  meta_keywords:
    "snack box, breakfast bars, healthy snacks, gift box, nutritious snacks, office snacks, 42 count, delicious chips",
  og_title: "Nutritious Snack Box - 42 Premium Snacks | Gift A Snack",
  og_description:
    "Amazing variety of snacks! Perfect for office teams, college students, and gifts. Fresh & high-quality snacks with fast delivery.",
  og_image:
    "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=1200",
  canonical_url: "",
  facebook_pixel_id: "",
};

const SEOContext = createContext<SEOContextType | undefined>(undefined);

export function SEOProvider({ children }: { children: ReactNode }) {
  const [seoData, setSeoData] = useState<SEOData>(defaultSEOData);
  const [isLoading, setIsLoading] = useState(true);

  const loadSEOData = async () => {
    try {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.info("SEO settings table not found, using default data");
        } else {
          logError("Error loading SEO data:", error);
        }
        return;
      }

      if (data && data.content) {
        setSeoData({ ...defaultSEOData, ...data.content });
      }
    } catch (error) {
      console.info("Using default SEO data due to database connection issue");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSEOData = (newData: Partial<SEOData>) => {
    setSeoData((prev) => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    loadSEOData();

    // Set up real-time subscription
    const channel = supabase
      .channel("seo_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seo_settings",
        },
        (payload) => {
          console.log("SEO settings updated:", payload);
          if (payload.new && payload.new.content) {
            setSeoData({ ...defaultSEOData, ...payload.new.content });
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Facebook Pixel injection
  useEffect(() => {
    if (seoData.facebook_pixel_id) {
      // Remove existing pixel script if any
      const existingScript = document.getElementById("facebook-pixel");
      if (existingScript) {
        existingScript.remove();
      }

      // Inject Facebook Pixel script
      const script = document.createElement("script");
      script.id = "facebook-pixel";
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${seoData.facebook_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      // Add noscript fallback
      const noscript = document.createElement("noscript");
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${seoData.facebook_pixel_id}&ev=PageView&noscript=1" />`;
      document.head.appendChild(noscript);
    }
  }, [seoData.facebook_pixel_id]);

  return (
    <HelmetProvider>
      <SEOContext.Provider value={{ seoData, updateSEOData, isLoading }}>
        <Helmet>
          {/* Basic Meta Tags */}
          <title>{seoData.meta_title}</title>
          <meta name="description" content={seoData.meta_description} />
          <meta name="keywords" content={seoData.meta_keywords} />

          {/* Open Graph Tags */}
          <meta property="og:title" content={seoData.og_title} />
          <meta property="og:description" content={seoData.og_description} />
          <meta property="og:image" content={seoData.og_image} />
          <meta property="og:type" content="website" />

          {/* Twitter Card Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoData.og_title} />
          <meta name="twitter:description" content={seoData.og_description} />
          <meta name="twitter:image" content={seoData.og_image} />

          {/* Canonical URL */}
          {seoData.canonical_url && (
            <link rel="canonical" href={seoData.canonical_url} />
          )}

          {/* Additional SEO Tags */}
          <meta name="robots" content="index, follow" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        </Helmet>
        {children}
      </SEOContext.Provider>
    </HelmetProvider>
  );
}

export function useSEO() {
  const context = useContext(SEOContext);
  if (context === undefined) {
    throw new Error("useSEO must be used within a SEOProvider");
  }
  return context;
}

// Hook for tracking events (can be expanded for other tracking platforms)
export function useTracking() {
  const { seoData } = useSEO();

  const trackEvent = (eventName: string, parameters?: any) => {
    // Facebook Pixel tracking
    if (
      seoData.facebook_pixel_id &&
      typeof window !== "undefined" &&
      (window as any).fbq
    ) {
      (window as any).fbq("track", eventName, parameters);
    }

    // Add other tracking platforms here in the future
    // Google Analytics: gtag('event', eventName, parameters);
    // TikTok Pixel: ttq.track(eventName, parameters);
  };

  const trackPurchase = (value: number, currency: string = "USD") => {
    trackEvent("Purchase", { value, currency });
  };

  const trackAddToCart = (contentName: string, value?: number) => {
    trackEvent("AddToCart", { content_name: contentName, value });
  };

  const trackViewContent = (
    contentName: string,
    contentType: string = "product",
  ) => {
    trackEvent("ViewContent", {
      content_name: contentName,
      content_type: contentType,
    });
  };

  return {
    trackEvent,
    trackPurchase,
    trackAddToCart,
    trackViewContent,
  };
}
