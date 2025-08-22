import { motion } from "framer-motion";
import { X, ShoppingCart, Star, Check, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PricingDisplay } from "@/components/PricingDisplay";

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToWalmart: () => void;
  productName: string;
  productImage: string;
  price: number;
  benefits: string[];
}

export function PurchaseConfirmationModal({
  isOpen,
  onClose,
  onProceedToWalmart,
  productName,
  productImage,
  price,
  benefits,
}: PurchaseConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto bg-white border-0 rounded-3xl shadow-2xl sm:w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 sm:p-6 md:p-8"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>

          <DialogHeader>
            <DialogTitle className="sr-only">Purchase Confirmation</DialogTitle>
            <DialogDescription className="sr-only">
              Complete your purchase with exclusive benefits and secure checkout
              through Walmart.
            </DialogDescription>
          </DialogHeader>

          {/* Urgency Timer */}
          <div className="mb-8 text-center">
            <CountdownTimer initialMinutes={10} />
          </div>

          {/* Product Section */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-center mb-6 md:mb-8">
            <div className="text-center order-2 md:order-1">
              <img
                src={productImage}
                alt={productName}
                className="w-full max-w-[200px] sm:max-w-xs mx-auto rounded-2xl shadow-lg"
                loading="lazy"
              />
            </div>

            <div className="order-1 md:order-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 line-clamp-3">
                {productName}
              </h2>

              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${i < 4 || (i === 4 && i < 4.6) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600">
                  4.6 ⭐ (23 reviews)
                </span>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4 mb-4">
                <PricingDisplay
                  salePrice={price}
                  size="md"
                  className="mb-2 [&>div:first-child]:flex-col sm:[&>div:first-child]:flex-row [&>div:first-child]:items-start sm:[&>div:first-child]:items-center [&>div:first-child]:gap-2 sm:[&>div:first-child]:gap-3"
                />
                <div className="text-xs sm:text-sm text-green-600 font-medium">
                  ✓ Fresh & high-quality snacks
                </div>
                <div className="text-xs sm:text-sm text-blue-600 font-medium">
                  ✓ Walmart+ offer eligible
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Why Choose This Product?
            </h3>
            <div className="grid gap-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-xl"
                >
                  <div className="bg-green-100 rounded-full p-1">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mb-8 bg-blue-50 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Shield className="h-6 w-6 text-blue-600 mb-1" />
                <span className="text-xs font-medium text-blue-800">
                  Secure Checkout
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Truck className="h-6 w-6 text-green-600 mb-1" />
                <span className="text-xs font-medium text-green-800">
                  Fast Delivery
                </span>
              </div>
              <div className="flex flex-col items-center">
                <Check className="h-6 w-6 text-purple-600 mb-1" />
                <span className="text-xs font-medium text-purple-800">
                  90-Day Returns
                </span>
              </div>
            </div>
          </div>

          {/* Special Offer Banner */}
          <div className="mb-8 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl text-center">
            <h3 className="text-lg font-bold mb-2">🔥 Limited Time Offer!</h3>
            <p className="text-sm">
              Don't miss out on this exclusive deal. Stock is running low!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 md:space-y-4">
            <Button
              onClick={onProceedToWalmart}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 md:py-4 text-lg md:text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 touch-manipulation"
            >
              Proceed to Walmart Checkout
              <ShoppingCart className="ml-2 md:ml-3 h-5 w-5 md:h-6 md:w-6" />
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="w-full py-3 md:py-4 text-base md:text-lg font-semibold rounded-2xl border-2 hover:bg-gray-50 touch-manipulation"
            >
              Continue Browsing
            </Button>
          </div>

          {/* Final Trust Message */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <Shield className="h-4 w-4 inline mr-1" />
            Secure transaction powered by Walmart
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
