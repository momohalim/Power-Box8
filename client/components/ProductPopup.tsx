import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingCart,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePopups } from "@/hooks/use-popups";
import { useTracking } from "@/hooks/use-seo";

interface ProductPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToWalmart: () => void;
}

export function ProductPopup({
  isOpen,
  onClose,
  onProceedToWalmart,
}: ProductPopupProps) {
  const { productPopupData } = usePopups();
  const { trackViewContent } = useTracking();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample product images - in a real app, these would come from the backend
  const productImages = [
    productPopupData.popup_image,
    "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F05b5599b733643de9ed02db80950feb9?format=webp&width=800",
    "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2Fec2c685b6b9d438f97083ea2cdb4458b?format=webp&width=800",
  ].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + productImages.length) % productImages.length,
    );
  };

  const handleProceedToWalmart = () => {
    trackViewContent("Purchase Intent - Walmart", "conversion");
    onClose();
    onProceedToWalmart();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed inset-4 z-[1001] mx-auto my-auto w-auto h-auto max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-[640px] sm:h-[90vh] sm:max-h-[800px] sm:translate-x-[-50%] sm:translate-y-[-50%] bg-white border-0 rounded-2xl sm:rounded-2xl shadow-2xl p-0 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
          <DialogPrimitive.Close className="absolute right-3 top-3 z-50 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow-md sm:hidden">
            <X className="h-5 w-5 text-gray-600" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            {/* HEADER - Fixed at top */}
            <div className="relative flex-shrink-0 bg-white border-b border-gray-200 p-3 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight pr-10 sm:pr-12">
                  {productPopupData.title}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-sm text-gray-600 mt-2 pr-8 sm:pr-0">
                  {productPopupData.description}
                </DialogDescription>
              </DialogHeader>

              {/* Close Button - Desktop only */}
              <button
                onClick={onClose}
                className="hidden sm:block absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10 shadow-sm"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* BODY - Scrollable content */}
            <div
              className="flex-1 overflow-y-auto px-3 py-4 sm:p-6"
              style={{
                maxHeight: "calc(100vh - 180px - 140px)",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/* Product Image */}
              <div className="relative mb-4 sm:mb-6">
                <div className="relative overflow-hidden rounded-xl shadow-lg bg-gray-50 mx-auto max-w-[280px] sm:max-w-none">
                  <img
                    src={
                      productImages[currentImageIndex] ||
                      productPopupData.popup_image
                    }
                    alt={productPopupData.product_name}
                    className="w-full h-40 sm:h-64 object-contain"
                    loading="lazy"
                    width={400}
                    height={256}
                  />
                </div>

                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-md hover:bg-white touch-manipulation"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-md hover:bg-white touch-manipulation"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Product Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center sm:text-left">
                {productPopupData.product_name}
              </h3>

              {/* Rating */}
              <div className="flex items-center justify-center sm:justify-start mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4 sm:h-4 sm:w-4",
                        i < Math.floor(productPopupData.rating)
                          ? "text-yellow-400 fill-current"
                          : i < productPopupData.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300",
                      )}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm sm:text-sm text-gray-700 font-medium">
                  {productPopupData.rating.toFixed(1)} ⭐ (
                  {productPopupData.reviews_count} reviews)
                </span>
              </div>

              {/* Pricing Section */}
              <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-gray-500 line-through text-lg">
                    ${productPopupData.original_price.toFixed(2)}
                  </span>
                  <span className="text-green-600 font-bold text-2xl">
                    ${productPopupData.discounted_price.toFixed(2)}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Save $
                    {(
                      productPopupData.original_price -
                      productPopupData.discounted_price
                    ).toFixed(2)}
                  </Badge>
                </div>

                {productPopupData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="text-sm text-blue-600 font-medium flex items-center gap-1"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Pieces Count */}
              <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    Pieces Count:
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {productPopupData.pieces_count} Items
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 text-center sm:text-left">
                  Perfect variety for extended enjoyment
                </p>
              </div>

              {/* Additional Details Section */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-3 text-center sm:text-left">
                  More Details
                </h4>
                <div className="space-y-2">
                  {productPopupData.additional_details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 sm:gap-3"
                    >
                      <div className="bg-green-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FOOTER - Fixed at bottom */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-3 sm:p-6 sticky bottom-0 z-10 shadow-lg sm:shadow-none">
              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={handleProceedToWalmart}
                  variant="primary"
                  size="lg"
                  sparkPosition="left"
                  className="w-full py-3 sm:py-4 rounded-xl touch-manipulation"
                >
                  Buy Now on Walmart
                  <ShoppingCart className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                  className="w-full py-2 sm:py-3 rounded-xl touch-manipulation border-2"
                >
                  Continue Browsing
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
