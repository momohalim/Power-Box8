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

interface WhyChooseContextType {
  whyChooseData: WhyChooseData;
  updateWhyChooseData: (data: Partial<WhyChooseData>) => void;
  isLoading: boolean;
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

const WhyChooseContext = createContext<WhyChooseContextType | undefined>(
  undefined,
);

export function WhyChooseProvider({ children }: { children: ReactNode }) {
  const [whyChooseData, setWhyChooseData] =
    useState<WhyChooseData>(defaultWhyChooseData);
  const [isLoading, setIsLoading] = useState(true);

  const loadWhyChooseData = async () => {
    try {
      const { data, error } = await supabase
        .from("why_choose_section")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.info(
            "Why choose section table not found, using default data",
          );
        } else {
          logError("Error loading why choose data:", error);
        }
        return;
      }

      if (data && data.content) {
        setWhyChooseData({ ...defaultWhyChooseData, ...data.content });
      }
    } catch (error) {
      console.info(
        "Using default why choose data due to database connection issue",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateWhyChooseData = (newData: Partial<WhyChooseData>) => {
    setWhyChooseData((prev) => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    loadWhyChooseData();

    // Set up real-time subscription
    const channel = supabase
      .channel("why_choose_section_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "why_choose_section",
        },
        (payload) => {
          console.log("Why choose section updated:", payload);
          if (payload.new && payload.new.content) {
            setWhyChooseData({
              ...defaultWhyChooseData,
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
    <WhyChooseContext.Provider
      value={{ whyChooseData, updateWhyChooseData, isLoading }}
    >
      {children}
    </WhyChooseContext.Provider>
  );
}

export function useWhyChoose() {
  const context = useContext(WhyChooseContext);
  if (context === undefined) {
    throw new Error("useWhyChoose must be used within a WhyChooseProvider");
  }
  return context;
}
