import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot, type Root } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/providers/DataProvider";
import { SupabaseAdminAuthProvider } from "@/hooks/use-supabase-admin-auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Hero from "./pages/admin/Hero";
import WhyChoose from "./pages/admin/WhyChoose";
import Walmart from "./pages/admin/Walmart";
import InsideBox from "./pages/admin/InsideBox";
import Testimonials from "./pages/admin/Testimonials";
import OfferPricing from "./pages/admin/OfferPricing";
import Footer from "./pages/admin/Footer";
import SEO from "./pages/admin/SEO";
import Popups from "./pages/admin/Popups";
import { SupabaseSetupTest } from "./components/SupabaseSetupTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseAdminAuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="hero" element={<Hero />} />
                <Route path="why-choose" element={<WhyChoose />} />
                <Route path="walmart" element={<Walmart />} />
                <Route path="inside-box" element={<InsideBox />} />
                <Route path="testimonials" element={<Testimonials />} />
                <Route path="offer-pricing" element={<OfferPricing />} />
                <Route path="footer" element={<Footer />} />
                <Route path="seo" element={<SEO />} />
                <Route path="popups" element={<Popups />} />
                <Route path="supabase-setup" element={<SupabaseSetupTest />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </SupabaseAdminAuthProvider>
  </QueryClientProvider>
);

// Robust root management to prevent createRoot warnings
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

// Extend the container type to include our custom property
interface ExtendedHTMLElement extends HTMLElement {
  _reactRoot?: Root;
}

const extendedContainer = container as ExtendedHTMLElement;

// Check if root already exists, if not create one
if (!extendedContainer._reactRoot) {
  extendedContainer._reactRoot = createRoot(container);
}

// Render the app
extendedContainer._reactRoot.render(<App />);
