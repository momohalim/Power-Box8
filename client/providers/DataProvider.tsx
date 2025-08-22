import { ReactNode } from "react";
import { SEOProvider } from "@/hooks/use-seo";
import { PopupProvider } from "@/hooks/use-popups";
import { HeroProvider } from "@/hooks/use-hero";
import { WhyChooseProvider } from "@/hooks/use-why-choose";
import { ProductGalleryProvider } from "@/hooks/use-product-gallery";
import { TrustProvider } from "@/hooks/use-trust";
import { ReviewsProvider } from "@/hooks/use-reviews";
import { OfferPricingProvider } from "@/hooks/use-offer-pricing";
import { FooterProvider } from "@/hooks/use-footer";
import { DataSyncProvider } from "@/hooks/use-data-sync";

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  return (
    <DataSyncProvider>
      <SEOProvider>
        <PopupProvider>
          <HeroProvider>
            <WhyChooseProvider>
              <ProductGalleryProvider>
                <TrustProvider>
                  <ReviewsProvider>
                    <OfferPricingProvider>
                      <FooterProvider>{children}</FooterProvider>
                    </OfferPricingProvider>
                  </ReviewsProvider>
                </TrustProvider>
              </ProductGalleryProvider>
            </WhyChooseProvider>
          </HeroProvider>
        </PopupProvider>
      </SEOProvider>
    </DataSyncProvider>
  );
}
