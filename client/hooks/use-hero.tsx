import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { logError } from "@/lib/error-utils";
import { useRealTimeSync } from "./use-data-sync";

interface HeroData {
  title: string;
  rating: number;
  reviews_count: number;
  sale_price: number;
  features: string[];
  delivery_text: string;
  urgency_text: string;
  primary_cta: string;
  secondary_cta: string;
  main_image: string;
  walmart_url: string;
}

interface HeroContextType {
  heroData: HeroData;
  updateHeroData: (data: Partial<HeroData>) => void;
  isLoading: boolean;
}

const defaultHeroData: HeroData = {
  title:
    "Nutritious Snack Box with Breakfast Bars and Delicious Chips | Gift A Snack (42 Count)",
  rating: 4.6,
  reviews_count: 23,
  sale_price: 31.95,
  features: ["Fresh & high-quality snacks", "Walmart+ offer eligible"],
  delivery_text: "Fast & reliable delivery",
  urgency_text: "Limited stock available",
  primary_cta: "View Product Details",
  secondary_cta: "Learn More About This Product",
  main_image:
    "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=800",
  walmart_url:
    "https://www.walmart.com/ip/Healthy-Snack-Box-Tasty-Nutrient-Rich-Variety-42-Count-by-Gift-A-Snack/14479818419?selectedSellerId=16964&selectedOfferId=BEA9DA42A8853A4C927EECB4D702F303&clickid=3PE2sMyDBxycW1s0QQThKWW7Ukp2AmR-AQ%3AGxo0&irgwc=1&sourceid=imp_3PE2sMyDBxycW1s0QQThKWW7Ukp2AmR-AQ%3AGxo0&veh=aff&wmlspartner=imp_5610446&affiliates_ad_id=565706&campaign_id=9383&sharedid=mp_16964_2016489964_knpf1_4mtlu49_BEA9DA42A8853A4C927EECB4D702F303&utm_source=landing&utm_medium=cta&utm_campaign=snackbox",
};

const HeroContext = createContext<HeroContextType | undefined>(undefined);

export function HeroProvider({ children }: { children: ReactNode }) {
  const [heroData, setHeroData] = useState<HeroData>(defaultHeroData);
  const [isLoading, setIsLoading] = useState(true);

  const loadHeroData = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_section")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.info("Hero section table not found, using default data");
        } else {
          console.warn("Error loading hero data:", error);
        }
        // Always ensure we have data even on error
        setHeroData(defaultHeroData);
        return;
      }

      if (data && data.content) {
        setHeroData({ ...defaultHeroData, ...data.content });
      } else {
        // Fallback to default data if no content
        setHeroData(defaultHeroData);
      }
    } catch (error) {
      console.info("Using default hero data due to database connection issue");
      // Always ensure we have data even on connection failure
      setHeroData(defaultHeroData);
    } finally {
      setIsLoading(false);
    }
  };

  const updateHeroData = (newData: Partial<HeroData>) => {
    const updatedData = { ...heroData, ...newData };
    setHeroData(updatedData);

    // Trigger additional update to ensure UI refreshes
    setTimeout(() => {
      setHeroData((prev) => ({ ...prev, ...newData }));
    }, 100);

    return updatedData;
  };

  // Real-time sync for updates from admin panel
  useRealTimeSync("hero_section", (payload) => {
    if (payload.new && payload.new.content) {
      console.log("Real-time hero update received:", payload.new.content);
      const newData = { ...defaultHeroData, ...payload.new.content };
      setHeroData(newData);

      // Show notification that data was updated (only on frontend, not admin)
      if (!window.location.pathname.startsWith("/admin")) {
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
        notification.textContent = "🔄 Content updated!";
        document.body.appendChild(notification);

        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 2000);
      }

      // Force re-render by updating state
      setIsLoading(false);
    }
  });

  // Listen for direct table updates
  useEffect(() => {
    const handleDirectUpdate = (event: CustomEvent) => {
      if (event.detail.new && event.detail.new.content) {
        const newData = { ...defaultHeroData, ...event.detail.new.content };
        setHeroData(newData);
      }
    };

    window.addEventListener("hero_section-update" as any, handleDirectUpdate);
    return () =>
      window.removeEventListener(
        "hero_section-update" as any,
        handleDirectUpdate,
      );
  }, []);

  useEffect(() => {
    loadHeroData();
  }, []);

  return (
    <HeroContext.Provider value={{ heroData, updateHeroData, isLoading }}>
      {children}
    </HeroContext.Provider>
  );
}

export function useHero() {
  const context = useContext(HeroContext);
  if (context === undefined) {
    throw new Error("useHero must be used within a HeroProvider");
  }
  return context;
}
