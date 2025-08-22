import { useState, useEffect } from "react";
import { useTracking } from "@/hooks/use-seo";
import { useHero } from "@/hooks/use-hero";
import { useWhyChoose } from "@/hooks/use-why-choose";
import { useProductGallery } from "@/hooks/use-product-gallery";
import { useTrust } from "@/hooks/use-trust";
import { useReviews } from "@/hooks/use-reviews";
import { useOfferPricing } from "@/hooks/use-offer-pricing";
import { useFooter } from "@/hooks/use-footer";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingCart,
  Check,
  Zap,
  Users,
  Shield,
  Gift,
  Package,
  Heart,
  BadgeCheck,
  Truck,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingDisplay } from "@/components/PricingDisplay";
import { FloatingSnacks } from "@/components/FloatingSnacks";
import { StickyCTA } from "@/components/StickyCTA";
import { CustomerReviews } from "@/components/CustomerReviews";
import { EnhancedExitIntentPopup } from "@/components/EnhancedExitIntentPopup";
import { ProductPopup } from "@/components/ProductPopup";
import { DatabaseFixPanel } from "@/components/DatabaseFixPanel";
import { useExitIntent } from "@/hooks/use-exit-intent";

export default function Index() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);

  // Dynamic data hooks
  const { heroData } = useHero();
  const { whyChooseData } = useWhyChoose();
  const { productGalleryData } = useProductGallery();
  const { trustData } = useTrust();
  const { reviewsData } = useReviews();
  const { offerPricingData } = useOfferPricing();
  const { footerData } = useFooter();

  // Tracking hook
  const { trackViewContent, trackAddToCart } = useTracking();

  // Dynamic data from backend
  const walmartUrl = heroData.walmart_url;
  const productImages = productGalleryData.images.map((img) => img.url);

  const handleBuyClick = (location: string) => {
    // Track conversion event and redirect directly
    console.log(`Buy clicked from: ${location}`);
    handleProceedToWalmart();
  };

  // Exit intent detection
  useExitIntent({
    enabled: !showExitIntent && !isModalOpen, // Only show if not already shown and modal is closed
    sensitivity: 20,
    delayInMs: 100,
    onExitIntent: () => {
      setShowExitIntent(true);
    },
  });

  const handleCloseExitIntent = () => {
    setShowExitIntent(false);
  };

  const handleSubscribe = (email?: string) => {
    console.log("Newsletter subscription", { email });
    // Here you could track the email signup
    setShowExitIntent(false);
    // You could show a thank you message or redirect
  };

  const handleProceedToWalmart = () => {
    // Actually redirect to Walmart
    console.log("Proceeding to Walmart checkout");
    // Track add to cart / purchase intent
    trackAddToCart("Nutritious Snack Box - 42 Count", heroData.sale_price);
    const link = document.createElement("a");
    link.href = walmartUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer nofollow";
    link.click();
  };

  const handleCardClick = () => {
    console.log("Card clicked - opening modal");
    setIsModalOpen(true);
    // Track product view
    trackViewContent("Nutritious Snack Box - 42 Count", "product");
  };

  const scrollToProduct = () => {
    document
      .getElementById("product-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Database Fix Panel - provides clear instructions to fix database errors */}
      <DatabaseFixPanel />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Floating Snack Animations */}
        <FloatingSnacks />

        {/* Professional Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column - Content */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  {heroData.title}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${i < Math.floor(heroData.rating) || (i === Math.floor(heroData.rating) && i < heroData.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-base sm:text-lg font-semibold text-gray-700">
                    {heroData.rating} ⭐
                  </span>
                  <span className="text-sm sm:text-base text-gray-600">
                    from {heroData.reviews_count} reviews
                  </span>
                </div>

                {/* Price Section */}
                <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <PricingDisplay
                      salePrice={heroData.sale_price}
                      size="lg"
                      className="[&>div:first-child]:flex-col sm:[&>div:first-child]:flex-row [&>div:first-child]:items-start sm:[&>div:first-child]:items-center [&>div:first-child]:gap-2 sm:[&>div:first-child]:gap-3"
                    />
                    <div className="flex flex-col">
                      {heroData.features.map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs sm:text-sm text-green-600 font-medium flex items-center gap-1"
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
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Urgency/Delivery Section */}
                <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      <span className="text-sm sm:text-base font-semibold text-green-800">
                        {heroData.delivery_text}
                      </span>
                    </div>
                    <span className="text-sm sm:text-base text-red-600 font-medium sm:ml-auto flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {heroData.urgency_text}
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                <Button
                  onClick={handleCardClick}
                  variant="primary"
                  size="xl"
                  sparkPosition="left"
                  className="w-full py-3 sm:py-4 mb-3 sm:mb-4 touch-manipulation"
                >
                  {heroData.primary_cta}
                  <ShoppingCart className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
                </Button>

                <Button
                  onClick={scrollToProduct}
                  variant="outline"
                  size="xl"
                  className="w-full py-3 sm:py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 touch-manipulation"
                >
                  {heroData.secondary_cta}
                </Button>
              </div>

              {/* Right Column - Product Image */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className="backdrop-blur-xl bg-white/20 rounded-3xl p-8 shadow-2xl border border-white/30">
                    <img
                      src={heroData.main_image}
                      alt={heroData.title}
                      className="w-full h-auto rounded-2xl shadow-lg"
                      loading="eager"
                      width={800}
                      height={600}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          id="product-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-gray-50 to-slate-50 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12 lg:mb-16">
              {whyChooseData.title}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyChooseData.benefits.map((benefit, index) => {
                // Map benefit icons for backward compatibility
                const iconMap = [Package, Gift, Zap, Users, Heart, BadgeCheck];
                const IconComponent =
                  iconMap[index % iconMap.length] || Package;

                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="relative bg-white rounded-2xl shadow-lg border-2 hover:shadow-2xl transition-all duration-500 overflow-hidden"
                    style={{ borderColor: "#007BFF" }}
                  >
                    {/* Product Image - Full height of upper portion */}
                    <div className="relative h-64 group overflow-hidden">
                      <img
                        src={benefit.image}
                        alt={benefit.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 transition-all duration-500"></div>

                      {/* Icon positioned in top-right corner on image */}
                      <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10">
                        <IconComponent
                          className={`h-6 w-6 ${
                            benefit.color === "blue"
                              ? "text-blue-600"
                              : benefit.color === "purple"
                                ? "text-purple-600"
                                : benefit.color === "green"
                                  ? "text-green-600"
                                  : benefit.color === "orange"
                                    ? "text-orange-600"
                                    : benefit.color === "red"
                                      ? "text-red-600"
                                      : "text-indigo-600"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Text content at bottom */}
                    <div className="p-6 text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA after Benefits */}
            <div className="text-center mt-8 sm:mt-12">
              <Button
                onClick={handleCardClick}
                variant="primary"
                size="lg"
                className="px-6 sm:px-8 py-3 sm:py-4 touch-manipulation"
              >
                View Product Details
                <ShoppingCart className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Trust Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 shadow-2xl text-white">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* Walmart Logo & Trust */}
                <div className="text-center">
                  <div className="bg-white rounded-xl p-4 mb-4 inline-block">
                    <div className="text-blue-600 font-bold text-2xl">
                      Walmart
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {trustData.walmart_info.text}
                  </h3>
                  <p className="text-blue-100">
                    {trustData.walmart_info.subtext}
                  </p>
                </div>

                {/* Seller Rating */}
                <div className="text-center">
                  <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                    <h3 className="text-2xl font-bold mb-2">
                      {trustData.seller_info.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => {
                          const rating = trustData.seller_info.rating;
                          const isFullStar = i < Math.floor(rating);
                          const isPartialStar =
                            i === Math.floor(rating) && rating % 1 !== 0;
                          const partialWidth = isPartialStar
                            ? `${(rating % 1) * 100}%`
                            : "0%";

                          return (
                            <div key={i} className="relative">
                              <Star className="h-5 w-5 text-gray-300" />
                              {(isFullStar || isPartialStar) && (
                                <div
                                  className="absolute inset-0 overflow-hidden"
                                  style={{
                                    width: isFullStar ? "100%" : partialWidth,
                                  }}
                                >
                                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-blue-100">
                      from {trustData.seller_info.reviews_count} reviews
                    </p>
                  </div>
                </div>

                {/* Returns Policy */}
                <div className="text-center">
                  <div className="bg-green-500 rounded-full p-4 mb-4 inline-block">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {trustData.guarantee.text}
                  </h3>
                  <p className="text-blue-100">{trustData.guarantee.subtext}</p>
                </div>
              </div>

              {/* CTA after Trust */}
              <div className="text-center mt-8">
                <Button
                  onClick={handleCardClick}
                  variant="glass"
                  size="lg"
                  className="px-6 sm:px-8 py-3 sm:py-4 touch-manipulation"
                >
                  View Product Details
                  <ShoppingCart className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Visual Gallery Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 py-20 bg-gradient-to-r from-gray-50 to-slate-50 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
              {productGalleryData.title}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {productGalleryData.images.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleCardClick}
                  className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer"
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    width={800}
                    height={256}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-lg">{image.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA after Gallery */}
            <div className="text-center mt-8 sm:mt-12">
              <Button
                onClick={handleCardClick}
                variant="primary"
                size="lg"
                className="px-6 sm:px-8 py-3 sm:py-4 touch-manipulation"
              >
                View Product Details
                <ShoppingCart className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Customer Reviews Section */}
        <CustomerReviews />

        {/* Final CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative z-10 py-16 sm:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4"
              >
                <svg
                  className="w-5 h-5 text-orange-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Bestseller - Limited Time Offer</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight"
              >
                {offerPricingData.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
              >
                {offerPricingData.subtitle}
              </motion.p>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Product Image */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="text-center lg:text-left"
              >
                <img
                  src={productGalleryData.images[0]?.url}
                  alt={
                    productGalleryData.images[0]?.alt || "Nutritious Snack Box"
                  }
                  className="w-full max-w-md mx-auto lg:mx-0 rounded-2xl shadow-2xl"
                  loading="lazy"
                  width={400}
                  height={300}
                />
              </motion.div>

              {/* Pricing and CTA */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-center lg:text-left"
              >
                {/* Enhanced Pricing Card */}
                <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-200 p-8 mb-8 hover:shadow-3xl transition-all duration-300">
                  {/* Price at Top */}
                  <div className="text-center mb-6">
                    <PricingDisplay
                      salePrice={offerPricingData.sale_price}
                      size="lg"
                      className="[&>div:first-child>span:last-child]:text-4xl sm:[&>div:first-child>span:last-child]:text-5xl [&>div:first-child>span:last-child]:font-bold [&>div:first-child>span:last-child]:text-green-600"
                    />
                  </div>

                  {/* Benefits with Checkmarks */}
                  <div className="space-y-3">
                    {offerPricingData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="bg-green-100 rounded-full p-1 flex-shrink-0">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced CTA Button */}
                <Button
                  onClick={handleCardClick}
                  variant="cta"
                  size="xl"
                  sparkPosition="left"
                  className="w-full px-8 py-6 mb-6 touch-manipulation"
                >
                  {offerPricingData.cta_text}
                  <ShoppingCart className="ml-3 h-6 w-6" />
                </Button>

                {/* Trust Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
                  {offerPricingData.trust_elements.map((element, index) => {
                    const IconComponent =
                      element.icon === "Shield"
                        ? Shield
                        : element.icon === "Truck"
                          ? Truck
                          : BadgeCheck;
                    const iconColor =
                      element.icon === "Shield"
                        ? "text-green-600"
                        : element.icon === "Truck"
                          ? "text-blue-600"
                          : "text-purple-600";

                    return (
                      <div key={index} className="flex items-center gap-2">
                        <IconComponent className={`h-5 w-5 ${iconColor}`} />
                        <span className="font-medium">{element.text}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Simple Footer */}
        <footer className="bg-slate-800 py-6 pb-20 sm:py-8 sm:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8">
              {footerData.social_links.map((link, index) => {
                // Map social icons
                const getIcon = (iconName: string) => {
                  switch (iconName) {
                    case "Facebook":
                      return <Facebook className="h-8 w-8" />;
                    case "Instagram":
                      return <Instagram className="h-8 w-8" />;
                    case "Twitter":
                      return <Twitter className="h-8 w-8" />;
                    case "Youtube":
                      return <Youtube className="h-8 w-8" />;
                    case "TikTok":
                      return (
                        <svg
                          className="h-8 w-8"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
                        </svg>
                      );
                    default:
                      return <Facebook className="h-8 w-8" />;
                  }
                };

                const getHoverColor = (iconName: string) => {
                  switch (iconName) {
                    case "Facebook":
                      return "hover:text-white";
                    case "Instagram":
                      return "hover:text-pink-400";
                    case "Twitter":
                      return "hover:text-blue-400";
                    case "Youtube":
                      return "hover:text-red-400";
                    case "TikTok":
                      return "hover:text-white";
                    default:
                      return "hover:text-white";
                  }
                };

                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 ${getHoverColor(link.icon)} transform hover:scale-110 transition-all duration-300`}
                    aria-label={`Follow us on ${link.name}`}
                  >
                    {getIcon(link.icon)}
                  </a>
                );
              })}
            </div>
          </div>
        </footer>

        {/* Product Details Popup */}
        <ProductPopup
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProceedToWalmart={handleProceedToWalmart}
        />

        {/* Sticky CTA for Mobile */}
        <StickyCTA onClick={handleCardClick} />

        {/* Exit Intent Popup */}
        <EnhancedExitIntentPopup
          isOpen={showExitIntent}
          onClose={handleCloseExitIntent}
          onSubscribe={handleSubscribe}
        />
      </div>

      {/* Enhanced Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: heroData.title,
            brand: {
              "@type": "Brand",
              name: "Gift-A-Snack",
            },
            image: productGalleryData.images.map((img) => img.url),
            description:
              "Nutritious snack box with breakfast bars and delicious chips, perfect for all ages. Comes with attractive packaging and heartwarming greeting card.",
            sku: "GAS-42-NUTRITIOUS",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: heroData.rating.toString(),
              reviewCount: heroData.reviews_count.toString(),
              bestRating: "5",
              worstRating: "1",
            },
            offers: {
              "@type": "Offer",
              url: walmartUrl,
              priceCurrency: "USD",
              price: heroData.sale_price.toString(),
              availability: "https://schema.org/InStock",
              seller: {
                "@type": "Organization",
                name: "Walmart",
                url: "https://www.walmart.com",
              },
            },
          }),
        }}
      />
    </>
  );
}
