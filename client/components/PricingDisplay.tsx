import { usePricing } from "@/hooks/use-pricing";
import { cn } from "@/lib/utils";

interface PricingDisplayProps {
  salePrice: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PricingDisplay({
  salePrice,
  size = "md",
  className,
}: PricingDisplayProps) {
  const { formattedSalePrice, formattedRegularPrice, savingsPercentage } =
    usePricing(salePrice);

  const sizeClasses = {
    sm: {
      regular: "text-sm",
      sale: "text-lg font-bold",
      savings: "text-xs",
    },
    md: {
      regular: "text-lg",
      sale: "text-2xl font-bold",
      savings: "text-sm",
    },
    lg: {
      regular: "text-xl",
      sale: "text-3xl font-bold",
      savings: "text-base",
    },
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-gray-500 line-through",
            sizeClasses[size].regular,
          )}
        >
          {formattedRegularPrice}
        </span>
        <span className={cn("text-emerald-600", sizeClasses[size].sale)}>
          {formattedSalePrice}
        </span>
      </div>
    </div>
  );
}
