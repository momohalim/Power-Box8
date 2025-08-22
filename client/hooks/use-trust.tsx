import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
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

interface TrustContextType {
  trustData: TrustData;
  updateTrustData: (data: Partial<TrustData>) => void;
  isLoading: boolean;
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

// Safe merge function that preserves nested object structure
function safelyMergeTrustData(
  defaultData: TrustData,
  contentData: any,
): TrustData {
  if (!contentData || typeof contentData !== "object") {
    return defaultData;
  }

  return {
    title:
      typeof contentData.title === "string"
        ? contentData.title
        : defaultData.title,
    seller_info: {
      name: contentData.seller_info?.name ?? defaultData.seller_info.name,
      rating:
        typeof contentData.seller_info?.rating === "number"
          ? contentData.seller_info.rating
          : defaultData.seller_info.rating,
      reviews_count:
        typeof contentData.seller_info?.reviews_count === "number"
          ? contentData.seller_info.reviews_count
          : defaultData.seller_info.reviews_count,
    },
    walmart_info: {
      text: contentData.walmart_info?.text ?? defaultData.walmart_info.text,
      subtext:
        contentData.walmart_info?.subtext ?? defaultData.walmart_info.subtext,
    },
    guarantee: {
      text: contentData.guarantee?.text ?? defaultData.guarantee.text,
      subtext: contentData.guarantee?.subtext ?? defaultData.guarantee.subtext,
    },
  };
}

const TrustContext = createContext<TrustContextType | undefined>(undefined);

export function TrustProvider({ children }: { children: ReactNode }) {
  const [trustData, setTrustData] = useState<TrustData>(defaultTrustData);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrustData = async () => {
    try {
      const { data, error } = await supabase
        .from("trust_section")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.info("Trust section table not found, using default data");
        } else {
          logDatabaseError("Error loading trust data", error);
        }
        // Always ensure we have valid data
        setTrustData(defaultTrustData);
        return;
      }

      if (data && data.content) {
        // Use safe merge instead of shallow spread
        const mergedData = safelyMergeTrustData(defaultTrustData, data.content);
        setTrustData(mergedData);
      } else {
        setTrustData(defaultTrustData);
      }
    } catch (error) {
      console.info("Using default trust data due to database connection issue");
      setTrustData(defaultTrustData);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrustData = (newData: Partial<TrustData>) => {
    setTrustData((prev) => {
      // Safe update that preserves nested structure
      return {
        title: newData.title ?? prev.title,
        seller_info: {
          name: newData.seller_info?.name ?? prev.seller_info.name,
          rating: newData.seller_info?.rating ?? prev.seller_info.rating,
          reviews_count:
            newData.seller_info?.reviews_count ??
            prev.seller_info.reviews_count,
        },
        walmart_info: {
          text: newData.walmart_info?.text ?? prev.walmart_info.text,
          subtext: newData.walmart_info?.subtext ?? prev.walmart_info.subtext,
        },
        guarantee: {
          text: newData.guarantee?.text ?? prev.guarantee.text,
          subtext: newData.guarantee?.subtext ?? prev.guarantee.subtext,
        },
      };
    });
  };

  useEffect(() => {
    loadTrustData();

    // Set up real-time subscription
    const channel = supabase
      .channel("trust_section_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trust_section",
        },
        (payload) => {
          console.log("Trust section updated:", payload);
          if (payload.new && payload.new.content) {
            const mergedData = safelyMergeTrustData(
              defaultTrustData,
              payload.new.content,
            );
            setTrustData(mergedData);
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
    <TrustContext.Provider value={{ trustData, updateTrustData, isLoading }}>
      {children}
    </TrustContext.Provider>
  );
}

export function useTrust() {
  const context = useContext(TrustContext);
  if (context === undefined) {
    throw new Error("useTrust must be used within a TrustProvider");
  }
  return context;
}
