import { useMemo } from "react";

interface PricingData {
  salePrice: number;
  regularPrice: number;
  savingsPercentage: number;
  formattedSalePrice: string;
  formattedRegularPrice: string;
}

export function usePricing(salePrice: number): PricingData {
  return useMemo(() => {
    // Calculate regular price using the formula: SalePrice × 1.3
    const calculatedRegularPrice = salePrice * 1.3;

    // Round up to the nearest value ending with .99
    const roundedRegularPrice = Math.ceil(calculatedRegularPrice - 0.01) + 0.99;

    // Calculate savings percentage
    const savingsPercentage = Math.round(
      (1 - salePrice / roundedRegularPrice) * 100,
    );

    // Format prices for display
    const formattedSalePrice = `$${salePrice.toFixed(2)}`;
    const formattedRegularPrice = `$${roundedRegularPrice.toFixed(2)}`;

    return {
      salePrice,
      regularPrice: roundedRegularPrice,
      savingsPercentage,
      formattedSalePrice,
      formattedRegularPrice,
    };
  }, [salePrice]);
}
