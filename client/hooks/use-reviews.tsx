import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { logDatabaseError } from "@/lib/error-handler";

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  image?: string; // URL for customer profile image
}

interface ReviewsData {
  title: string;
  overall_rating: number;
  total_reviews: number;
  reviews: Review[];
}

interface ReviewsContextType {
  reviewsData: ReviewsData;
  updateReviewsData: (data: Partial<ReviewsData>) => void;
  isLoading: boolean;
}

const defaultReviewsData: ReviewsData = {
  title: "What Our Customers Say",
  overall_rating: 4.6,
  total_reviews: 27,
  reviews: [
    {
      name: "Sarah M.",
      rating: 5,
      text: "Amazing variety! Perfect for our office team. Everyone loved the selection of snacks.",
      date: "2 weeks ago",
      verified: true,
      image: "",
    },
    {
      name: "Mike D.",
      rating: 5,
      text: "Great gift idea! Sent this to my college son and he was thrilled with all the different snacks.",
      date: "1 month ago",
      verified: true,
      image: "",
    },
    {
      name: "Lisa K.",
      rating: 4,
      text: "Good quality snacks and fast delivery. Would definitely order again.",
      date: "3 weeks ago",
      verified: true,
      image: "",
    },
    {
      name: "James T.",
      rating: 5,
      text: "Excellent quality and presentation. The packaging is beautiful and the snacks are fresh and delicious.",
      date: "1 week ago",
      verified: true,
      image: "",
    },
    {
      name: "Emily R.",
      rating: 5,
      text: "Perfect for our company break room! Everyone keeps asking where we got these amazing snacks.",
      date: "5 days ago",
      verified: true,
      image: "",
    },
    {
      name: "David C.",
      rating: 4,
      text: "Great variety and fast shipping. My kids love the breakfast bars and I enjoy the healthier options.",
      date: "4 days ago",
      verified: true,
      image: "",
    },
  ],
};

// Safe merge function that preserves structure
function safelyMergeReviewsData(
  defaultData: ReviewsData,
  contentData: any,
): ReviewsData {
  if (!contentData || typeof contentData !== "object") {
    return defaultData;
  }

  return {
    title:
      typeof contentData.title === "string"
        ? contentData.title
        : defaultData.title,
    overall_rating:
      typeof contentData.overall_rating === "number"
        ? contentData.overall_rating
        : defaultData.overall_rating,
    total_reviews:
      typeof contentData.total_reviews === "number"
        ? contentData.total_reviews
        : defaultData.total_reviews,
    reviews: Array.isArray(contentData.reviews)
      ? contentData.reviews
      : defaultData.reviews,
  };
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviewsData, setReviewsData] =
    useState<ReviewsData>(defaultReviewsData);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviewsData = async () => {
    try {
      const { data, error } = await supabase
        .from("customer_reviews")
        .select("*")
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.code === "42P01") {
          console.info("Customer reviews table not found, using default data");
        } else {
          logDatabaseError("Error loading reviews data", error);
        }
        // Always ensure we have valid data
        setReviewsData(defaultReviewsData);
        return;
      }

      if (data && data.content) {
        // Use safe merge instead of shallow spread
        const mergedData = safelyMergeReviewsData(
          defaultReviewsData,
          data.content,
        );
        setReviewsData(mergedData);
      } else {
        setReviewsData(defaultReviewsData);
      }
    } catch (error) {
      logDatabaseError("Catch block - reviews error", error);
      console.info(
        "Using default reviews data due to database connection issue",
      );
      setReviewsData(defaultReviewsData);
    } finally {
      setIsLoading(false);
    }
  };

  const updateReviewsData = (newData: Partial<ReviewsData>) => {
    setReviewsData((prev) => {
      // Safe update that preserves structure
      return {
        title: newData.title ?? prev.title,
        overall_rating: newData.overall_rating ?? prev.overall_rating,
        total_reviews: newData.total_reviews ?? prev.total_reviews,
        reviews: Array.isArray(newData.reviews)
          ? newData.reviews
          : prev.reviews,
      };
    });
  };

  useEffect(() => {
    loadReviewsData();

    // Set up real-time subscription
    const channel = supabase
      .channel("customer_reviews_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customer_reviews",
        },
        (payload) => {
          console.log("Customer reviews updated:", payload);
          if (payload.new && payload.new.content) {
            const mergedData = safelyMergeReviewsData(
              defaultReviewsData,
              payload.new.content,
            );
            setReviewsData(mergedData);
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
    <ReviewsContext.Provider
      value={{ reviewsData, updateReviewsData, isLoading }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
}
