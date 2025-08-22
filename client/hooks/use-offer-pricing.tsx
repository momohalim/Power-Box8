import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { logDatabaseError } from "@/lib/error-handler";

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
}

interface OfferPricingContextType {
  offerPricingData: OfferPricingData;
  updateOfferPricingData: (data: Partial<OfferPricingData>) => void;
  isLoading: boolean;
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
};

const OfferPricingContext = createContext<OfferPricingContextType | undefined>(
  undefined,
);

export function OfferPricingProvider({ children }: { children: ReactNode }) {
  const [offerPricingData, setOfferPricingData] = useState<OfferPricingData>(
    defaultOfferPricingData,
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadOfferPricingData = async () => {
    try {
      const { data, error } = await supabase
        .from("offer_pricing")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.info("Offer pricing table not found, using default data");
        } else {
          logDatabaseError("Error loading offer pricing data", error);
        }
        return;
      }

      if (data && data.content) {
        setOfferPricingData({ ...defaultOfferPricingData, ...data.content });
      }
    } catch (error) {
      logDatabaseError("Catch block - offer pricing error", error);
      console.info(
        "Using default offer pricing data due to database connection issue",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateOfferPricingData = (newData: Partial<OfferPricingData>) => {
    setOfferPricingData((prev) => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    loadOfferPricingData();

    // Set up real-time subscription
    const channel = supabase
      .channel("offer_pricing_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offer_pricing",
        },
        (payload) => {
          console.log("Offer pricing updated:", payload);
          if (payload.new && payload.new.content) {
            setOfferPricingData({
              ...defaultOfferPricingData,
              ...payload.new.content,
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <OfferPricingContext.Provider
      value={{ offerPricingData, updateOfferPricingData, isLoading }}
    >
      {children}
    </OfferPricingContext.Provider>
  );
}

export function useOfferPricing() {
  const context = useContext(OfferPricingContext);
  if (context === undefined) {
    throw new Error(
      "useOfferPricing must be used within a OfferPricingProvider",
    );
  }
  return context;
}
