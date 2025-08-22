import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyCTAProps {
  onClick: () => void;
}

export function StickyCTA({ onClick }: StickyCTAProps) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-2 left-4 right-4 z-40 md:left-auto md:right-4 md:bottom-4 md:w-auto"
    >
      {/* Mobile: Full width bottom bar */}
      <div className="md:hidden">
        <div className="bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm p-4 rounded-t-2xl">
          <Button
            onClick={onClick}
            variant="primary"
            size="xl"
            sparkPosition="left"
            className="w-full py-4"
          >
            View Product Details
            <ShoppingCart className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop: Floating button */}
      <div className="hidden md:block">
        <Button
          onClick={onClick}
          variant="primary"
          size="lg"
          sparkPosition="left"
          className="px-6 py-3 rounded-full"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Quick View
        </Button>
      </div>
    </motion.div>
  );
}
