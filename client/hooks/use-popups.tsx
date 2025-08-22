import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { logError } from "@/lib/error-utils";

interface ProductPopupData {
  title: string;
  description: string;
  product_name: string;
  rating: number;
  reviews_count: number;
  original_price: number;
  discounted_price: number;
  features: string[];
  pieces_count: number;
  additional_details: string[];
  popup_image: string;
}

interface ExitIntentPopupData {
  title: string;
  description: string;
  email_placeholder: string;
  subscribe_button_text: string;
  dismiss_button_text: string;
  privacy_note: string;
  destination_email: string;
  mailchimp_api_key: string;
  mailchimp_list_id: string;
  brevo_api_key: string;
  brevo_list_id: string;
}

interface PopupContextType {
  productPopupData: ProductPopupData;
  exitIntentPopupData: ExitIntentPopupData;
  updateProductPopupData: (data: Partial<ProductPopupData>) => void;
  updateExitIntentPopupData: (data: Partial<ExitIntentPopupData>) => void;
  isLoading: boolean;
}

const defaultProductPopupData: ProductPopupData = {
  title:
    "Nutritious Snack Box with Breakfast Bars and Delicious Chips | Gift A Snack (42 Count)",
  description:
    "View detailed product information, pricing, and purchase options for this 42-piece snack collection.",
  product_name: "Nutritious Snack Box - Gift A Snack",
  rating: 4.6,
  reviews_count: 23,
  original_price: 42.99,
  discounted_price: 31.95,
  features: ["Fresh & high-quality snacks", "Walmart+ offer eligible"],
  pieces_count: 42,
  additional_details: [
    "Ultimate snack experience in a beautifully designed high-end packaging box",
    "Packed with a variety of breakfast bars and savory snacks for daily energy",
    "Individually packaged snacks for convenient grab-and-go options",
    "Ideal for adults, teens, and college students alike",
    "Arrives with a heartwarming greeting card for a personal touch",
  ],
  popup_image:
    "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=800",
};

const defaultExitIntentPopupData: ExitIntentPopupData = {
  title: "Stay Updated",
  description:
    "👉 Subscribe now to be the first to know about our upcoming exclusive offers\n\n👉 Join our mailing list and get the latest news and special deals before anyone else.",
  email_placeholder: "👉 Enter your email here",
  subscribe_button_text: "👉 Subscribe Now",
  dismiss_button_text: "👉 Maybe later",
  privacy_note:
    "👉 🔒 We will never send you spam. You can unsubscribe anytime",
  destination_email: "",
  mailchimp_api_key: "",
  mailchimp_list_id: "",
  brevo_api_key: "",
  brevo_list_id: "",
};

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [productPopupData, setProductPopupData] = useState<ProductPopupData>(
    defaultProductPopupData,
  );
  const [exitIntentPopupData, setExitIntentPopupData] =
    useState<ExitIntentPopupData>(defaultExitIntentPopupData);
  const [isLoading, setIsLoading] = useState(true);

  const loadPopupData = async () => {
    try {
      // Load Product Popup Data
      try {
        const { data: productData, error: productError } = await supabase
          .from("product_popup")
          .select("*")
          .single();

        if (productError) {
          // Silently handle expected missing table errors
          if (
            productError.code === "PGRST116" ||
            productError.code === "42P01" ||
            productError.message?.includes("relation") ||
            productError.message?.includes("table")
          ) {
            // Expected: table doesn't exist yet, using defaults
          } else {
            // Only log unexpected errors
            console.warn(
              "Unexpected product popup error:",
              productError.code,
              productError.message,
            );
          }
        } else if (productData && productData.content) {
          setProductPopupData({
            ...defaultProductPopupData,
            ...productData.content,
          });
        }
      } catch (productCatchError) {
        // Expected: Database/table doesn't exist, using defaults
      }

      // Load Exit Intent Popup Data
      try {
        const { data: exitData, error: exitError } = await supabase
          .from("exit_intent_popup")
          .select("*")
          .single();

        if (exitError) {
          // Silently handle expected missing table errors
          if (
            exitError.code === "PGRST116" ||
            exitError.code === "42P01" ||
            exitError.message?.includes("relation") ||
            exitError.message?.includes("table")
          ) {
            // Expected: table doesn't exist yet, using defaults
          } else {
            // Only log unexpected errors
            console.warn(
              "Unexpected exit intent popup error:",
              exitError.code,
              exitError.message,
            );
          }
        } else if (exitData && exitData.content) {
          setExitIntentPopupData({
            ...defaultExitIntentPopupData,
            ...exitData.content,
          });
        }
      } catch (exitCatchError) {
        console.info(
          "Exit intent popup table likely doesn't exist, using defaults",
        );
      }
    } catch (error) {
      console.info("Using default popup data due to database connection issue");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductPopupData = (newData: Partial<ProductPopupData>) => {
    setProductPopupData((prev) => ({ ...prev, ...newData }));
  };

  const updateExitIntentPopupData = (newData: Partial<ExitIntentPopupData>) => {
    setExitIntentPopupData((prev) => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    loadPopupData();

    // Set up real-time subscriptions for both popup tables
    const productChannel = supabase
      .channel("product_popup_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "product_popup",
        },
        (payload) => {
          console.log("Product popup updated:", payload);
          if (payload.new && payload.new.content) {
            setProductPopupData({
              ...defaultProductPopupData,
              ...payload.new.content,
            });
          }
        },
      )
      .subscribe();

    const exitIntentChannel = supabase
      .channel("exit_intent_popup_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "exit_intent_popup",
        },
        (payload) => {
          console.log("Exit intent popup updated:", payload);
          if (payload.new && payload.new.content) {
            setExitIntentPopupData({
              ...defaultExitIntentPopupData,
              ...payload.new.content,
            });
          }
        },
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(productChannel);
      supabase.removeChannel(exitIntentChannel);
    };
  }, []);

  return (
    <PopupContext.Provider
      value={{
        productPopupData,
        exitIntentPopupData,
        updateProductPopupData,
        updateExitIntentPopupData,
        isLoading,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
}

export function usePopups() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error("usePopups must be used within a PopupProvider");
  }
  return context;
}

// Hook for handling email subscriptions
export function useEmailSubscription() {
  const { exitIntentPopupData } = usePopups();

  const subscribeEmail = async (email: string) => {
    try {
      // Send to destination email if provided
      if (exitIntentPopupData.destination_email) {
        // In a real implementation, you would send this to your backend
        console.log(
          `Sending subscription email ${email} to ${exitIntentPopupData.destination_email}`,
        );
      }

      // Mailchimp integration
      if (
        exitIntentPopupData.mailchimp_api_key &&
        exitIntentPopupData.mailchimp_list_id
      ) {
        // Mailchimp API call would go here
        console.log("Sending to Mailchimp:", {
          email,
          listId: exitIntentPopupData.mailchimp_list_id,
        });
      }

      // Brevo integration
      if (
        exitIntentPopupData.brevo_api_key &&
        exitIntentPopupData.brevo_list_id
      ) {
        // Brevo API call would go here
        console.log("Sending to Brevo:", {
          email,
          listId: exitIntentPopupData.brevo_list_id,
        });
      }

      // Store in Supabase for backup
      await supabase.from("email_subscriptions").insert({
        email,
        subscribed_at: new Date().toISOString(),
        source: "exit_intent_popup",
      });

      return { success: true, message: "Successfully subscribed!" };
    } catch (error) {
      logError("Error subscribing email:", error);
      return {
        success: false,
        message: "Error subscribing. Please try again.",
      };
    }
  };

  return { subscribeEmail };
}
