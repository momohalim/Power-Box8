import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { logDatabaseError } from "@/lib/error-handler";

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface FooterData {
  social_links: SocialLink[];
}

interface FooterContextType {
  footerData: FooterData;
  updateFooterData: (data: Partial<FooterData>) => void;
  isLoading: boolean;
}

const defaultFooterData: FooterData = {
  social_links: [
    {
      name: "Facebook",
      url: "https://facebook.com",
      icon: "Facebook",
    },
    {
      name: "Instagram",
      url: "https://instagram.com",
      icon: "Instagram",
    },
    {
      name: "Twitter",
      url: "https://twitter.com",
      icon: "Twitter",
    },
    {
      name: "YouTube",
      url: "https://youtube.com",
      icon: "Youtube",
    },
    {
      name: "TikTok",
      url: "https://tiktok.com",
      icon: "TikTok",
    },
  ],
};

const FooterContext = createContext<FooterContextType | undefined>(undefined);

export function FooterProvider({ children }: { children: ReactNode }) {
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);
  const [isLoading, setIsLoading] = useState(true);

  const loadFooterData = async () => {
    try {
      const { data, error } = await supabase
        .from("footer")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.info("Footer table not found, using default data");
        } else {
          logDatabaseError("Error loading footer data", error);
        }
        return;
      }

      if (data && data.content) {
        setFooterData({ ...defaultFooterData, ...data.content });
      }
    } catch (error) {
      logDatabaseError("Catch block - footer error", error);
      console.info(
        "Using default footer data due to database connection issue",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateFooterData = (newData: Partial<FooterData>) => {
    setFooterData((prev) => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    loadFooterData();

    // Set up real-time subscription
    const channel = supabase
      .channel("footer_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "footer",
        },
        (payload) => {
          console.log("Footer updated:", payload);
          if (payload.new && payload.new.content) {
            setFooterData({ ...defaultFooterData, ...payload.new.content });
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
    <FooterContext.Provider value={{ footerData, updateFooterData, isLoading }}>
      {children}
    </FooterContext.Provider>
  );
}

export function useFooter() {
  const context = useContext(FooterContext);
  if (context === undefined) {
    throw new Error("useFooter must be used within a FooterProvider");
  }
  return context;
}
