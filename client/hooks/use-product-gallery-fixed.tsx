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

interface GalleryImage {
  url: string;
  alt: string;
  title: string;
}

interface ProductGalleryData {
  title: string;
  images: GalleryImage[];
}

interface ProductGalleryContextType {
  productGalleryData: ProductGalleryData;
  updateProductGalleryData: (data: Partial<ProductGalleryData>) => void;
  isLoading: boolean;
}

const defaultProductGalleryData: ProductGalleryData = {
  title: "Delicious Snack Variety",
  images: [
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=800",
      alt: "Nutritious Snack Box",
      title: "Complete Snack Collection",
    },
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F79b7dfd5cb0f4ca0b96e836c27c6ef40%2F4d9abe9f679440fcb3470285697707f4?format=webp&width=800",
      alt: "Breakfast Bars",
      title: "Healthy Breakfast Options",
    },
    {
      url: "https://cdn.builder.io/api/v1/image/assets%2F79b7dfd5cb0f4ca0b96e836c27c6ef40%2F6305c43f8b6449fc8926c50b002e25fe?format=webp&width=800",
      alt: "Premium Packaging",
      title: "Professional Presentation",
    },
  ],
};

// Safe merge function that preserves structure
function safelyMergeData(defaultData: ProductGalleryData, contentData: any): ProductGalleryData {
  if (!contentData || typeof contentData !== 'object') {
    return defaultData;
  }

  return {
    title: typeof contentData.title === 'string' ? contentData.title : defaultData.title,
    images: Array.isArray(contentData.images) ? contentData.images : defaultData.images,
  };
}

const ProductGalleryContext = createContext<ProductGalleryContextType | undefined>(undefined);

export function ProductGalleryProvider({ children }: { children: ReactNode }) {
  const [productGalleryData, setProductGalleryData] = useState<ProductGalleryData>(defaultProductGalleryData);
  const [isLoading, setIsLoading] = useState(true);

  const loadProductGalleryData = async () => {
    try {
      const { data, error } = await supabase
        .from("product_gallery")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.info("Product gallery table not found, using default data");
        } else {
          logError("Error loading product gallery data:", error);
        }
        // Always ensure we have valid data
        setProductGalleryData(defaultProductGalleryData);
        return;
      }

      if (data && data.content) {
        // Use safe merge instead of shallow spread
        const mergedData = safelyMergeData(defaultProductGalleryData, data.content);
        setProductGalleryData(mergedData);
      } else {
        setProductGalleryData(defaultProductGalleryData);
      }
    } catch (error) {
      console.info("Using default product gallery data due to database connection issue");
      setProductGalleryData(defaultProductGalleryData);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductGalleryData = (newData: Partial<ProductGalleryData>) => {
    setProductGalleryData((prev) => {
      // Safe update that preserves structure
      return {
        title: newData.title ?? prev.title,
        images: Array.isArray(newData.images) ? newData.images : prev.images,
      };
    });
  };

  // Real-time sync using the centralized system (removes duplicate subscriptions)
  useRealTimeSync("product_gallery", (payload) => {
    if (payload.new && payload.new.content) {
      console.log("Real-time product gallery update received:", payload.new.content);
      const mergedData = safelyMergeData(defaultProductGalleryData, payload.new.content);
      setProductGalleryData(mergedData);
    }
  });

  useEffect(() => {
    loadProductGalleryData();
  }, []);

  return (
    <ProductGalleryContext.Provider 
      value={{ productGalleryData, updateProductGalleryData, isLoading }}
    >
      {children}
    </ProductGalleryContext.Provider>
  );
}

export function useProductGallery() {
  const context = useContext(ProductGalleryContext);
  if (context === undefined) {
    throw new Error("useProductGallery must be used within a ProductGalleryProvider");
  }
  return context;
}
