import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useReviews } from "@/hooks/use-reviews";

interface CustomerReview {
  id: number;
  name: string;
  photo: string;
  rating: number;
  review: string;
}

// Default placeholder photos for reviews
const defaultPhotos = [
  "https://images.pexels.com/photos/8872492/pexels-photo-8872492.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80",
];

// Memoized review card component for better performance
const ReviewCard = ({
  review,
  isDuplicate = false,
}: {
  review: CustomerReview;
  isDuplicate?: boolean;
}) => (
  <div
    className="flex-shrink-0 w-72 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-5 border-2 hover:shadow-2xl transition-all duration-300"
    style={{ borderColor: "#007BFF" }}
  >
    {/* Quotation Mark Icon */}
    <div className="flex justify-center mb-3">
      <div className="bg-blue-100 rounded-full p-2">
        <Quote className="h-5 w-5 text-blue-600" />
      </div>
    </div>

    {/* Customer Photo */}
    <div className="flex justify-center mb-4">
      <img
        src={review.photo}
        alt={review.name}
        className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-md"
        loading="lazy"
        width={56}
        height={56}
      />
    </div>

    {/* Customer Name and Rating */}
    <div className="text-center mb-4">
      <h3 className="font-semibold text-gray-900 text-base mb-2">
        {review.name}
      </h3>
      <div className="flex justify-center gap-1">
        {[...Array(review.rating)].map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 text-yellow-500 fill-current drop-shadow-sm"
          />
        ))}
      </div>
    </div>

    {/* Review Text */}
    <p className="text-gray-700 text-center leading-relaxed text-sm font-medium">
      {review.review}
    </p>
  </div>
);

export function CustomerReviews() {
  const { reviewsData } = useReviews();

  // Map backend reviews data to component format with placeholder photos
  const customerReviews: CustomerReview[] = reviewsData.reviews.map(
    (review, index) => ({
      id: index + 1,
      name: review.name,
      photo: defaultPhotos[index % defaultPhotos.length],
      rating: review.rating,
      review: review.text,
    }),
  );

  // Double the array for seamless infinite scroll
  const extendedReviews = [...customerReviews, ...customerReviews];

  return (
    <section className="relative py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {reviewsData.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who love our nutritious snack
            boxes
          </p>
        </div>

        {/* Scrolling Container */}
        <div className="relative overflow-hidden">
          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

          {/* Scrolling Animation */}
          <motion.div
            className="flex gap-4 w-max"
            animate={{
              x: [0, -1500], // Adjusted for smaller card width
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {extendedReviews.map((review, index) => (
              <ReviewCard
                key={`review-${review.id}-${Math.floor(index / customerReviews.length)}`}
                review={review}
                isDuplicate={index >= customerReviews.length}
              />
            ))}
          </motion.div>
        </div>

        {/* Trust Indicator */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 text-yellow-500 fill-current"
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              Based on verified customer reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
