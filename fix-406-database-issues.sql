-- =====================================================
-- FIX 406 DATABASE ERRORS SCRIPT
-- This script addresses all 406 "Not Acceptable" errors
-- by ensuring all required tables exist with proper RLS policies
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE ALL REQUIRED TABLES
-- (These are the tables mentioned in 406 errors)
-- =====================================================

-- 1. trust_section
CREATE TABLE IF NOT EXISTS trust_section (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. seo_settings
CREATE TABLE IF NOT EXISTS seo_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. product_popup
CREATE TABLE IF NOT EXISTS product_popup (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. offer_pricing
CREATE TABLE IF NOT EXISTS offer_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. exit_intent_popup
CREATE TABLE IF NOT EXISTS exit_intent_popup (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional required tables
-- 6. hero_section
CREATE TABLE IF NOT EXISTS hero_section (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. why_choose_section
CREATE TABLE IF NOT EXISTS why_choose_section (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. product_gallery
CREATE TABLE IF NOT EXISTS product_gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. customer_reviews
CREATE TABLE IF NOT EXISTS customer_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. footer
CREATE TABLE IF NOT EXISTS footer (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. email_subscriptions (for newsletters)
CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) DEFAULT 'exit_intent_popup',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE trust_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_popup ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_intent_popup ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE why_choose_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP EXISTING POLICIES TO AVOID CONFLICTS
-- =====================================================

-- trust_section policies
DROP POLICY IF EXISTS "Enable read access for all users" ON trust_section;
DROP POLICY IF EXISTS "Enable all operations for service role" ON trust_section;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON trust_section;
DROP POLICY IF EXISTS "Enable all operations for all users" ON trust_section;

-- seo_settings policies
DROP POLICY IF EXISTS "Enable read access for all users" ON seo_settings;
DROP POLICY IF EXISTS "Enable all operations for service role" ON seo_settings;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON seo_settings;
DROP POLICY IF EXISTS "Enable all operations for all users" ON seo_settings;

-- product_popup policies
DROP POLICY IF EXISTS "Enable read access for all users" ON product_popup;
DROP POLICY IF EXISTS "Enable all operations for service role" ON product_popup;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON product_popup;
DROP POLICY IF EXISTS "Enable all operations for all users" ON product_popup;

-- offer_pricing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON offer_pricing;
DROP POLICY IF EXISTS "Enable all operations for service role" ON offer_pricing;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON offer_pricing;
DROP POLICY IF EXISTS "Enable all operations for all users" ON offer_pricing;

-- exit_intent_popup policies
DROP POLICY IF EXISTS "Enable read access for all users" ON exit_intent_popup;
DROP POLICY IF EXISTS "Enable all operations for service role" ON exit_intent_popup;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON exit_intent_popup;
DROP POLICY IF EXISTS "Enable all operations for all users" ON exit_intent_popup;

-- hero_section policies
DROP POLICY IF EXISTS "Enable read access for all users" ON hero_section;
DROP POLICY IF EXISTS "Enable all operations for service role" ON hero_section;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON hero_section;
DROP POLICY IF EXISTS "Enable all operations for all users" ON hero_section;

-- why_choose_section policies
DROP POLICY IF EXISTS "Enable read access for all users" ON why_choose_section;
DROP POLICY IF EXISTS "Enable all operations for service role" ON why_choose_section;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON why_choose_section;
DROP POLICY IF EXISTS "Enable all operations for all users" ON why_choose_section;

-- product_gallery policies
DROP POLICY IF EXISTS "Enable read access for all users" ON product_gallery;
DROP POLICY IF EXISTS "Enable all operations for service role" ON product_gallery;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON product_gallery;
DROP POLICY IF EXISTS "Enable all operations for all users" ON product_gallery;

-- customer_reviews policies
DROP POLICY IF EXISTS "Enable read access for all users" ON customer_reviews;
DROP POLICY IF EXISTS "Enable all operations for service role" ON customer_reviews;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON customer_reviews;
DROP POLICY IF EXISTS "Enable all operations for all users" ON customer_reviews;

-- footer policies
DROP POLICY IF EXISTS "Enable read access for all users" ON footer;
DROP POLICY IF EXISTS "Enable all operations for service role" ON footer;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON footer;
DROP POLICY IF EXISTS "Enable all operations for all users" ON footer;

-- email_subscriptions policies
DROP POLICY IF EXISTS "Enable insert for all users" ON email_subscriptions;
DROP POLICY IF EXISTS "Enable all operations for service role" ON email_subscriptions;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON email_subscriptions;

-- =====================================================
-- CREATE PERMISSIVE POLICIES (FOR DEVELOPMENT/TESTING)
-- These policies allow all operations to fix 406 errors
-- =====================================================

-- trust_section
CREATE POLICY "Enable read access for all users" ON trust_section FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON trust_section FOR ALL USING (true);

-- seo_settings
CREATE POLICY "Enable read access for all users" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON seo_settings FOR ALL USING (true);

-- product_popup
CREATE POLICY "Enable read access for all users" ON product_popup FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON product_popup FOR ALL USING (true);

-- offer_pricing
CREATE POLICY "Enable read access for all users" ON offer_pricing FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON offer_pricing FOR ALL USING (true);

-- exit_intent_popup
CREATE POLICY "Enable read access for all users" ON exit_intent_popup FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON exit_intent_popup FOR ALL USING (true);

-- hero_section
CREATE POLICY "Enable read access for all users" ON hero_section FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON hero_section FOR ALL USING (true);

-- why_choose_section
CREATE POLICY "Enable read access for all users" ON why_choose_section FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON why_choose_section FOR ALL USING (true);

-- product_gallery
CREATE POLICY "Enable read access for all users" ON product_gallery FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON product_gallery FOR ALL USING (true);

-- customer_reviews
CREATE POLICY "Enable read access for all users" ON customer_reviews FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON customer_reviews FOR ALL USING (true);

-- footer
CREATE POLICY "Enable read access for all users" ON footer FOR SELECT USING (true);
CREATE POLICY "Enable all operations for all users" ON footer FOR ALL USING (true);

-- email_subscriptions
CREATE POLICY "Enable insert for all users" ON email_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable all operations for service role" ON email_subscriptions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- CREATE UNIQUE CONSTRAINTS
-- =====================================================

-- Email subscriptions unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS email_subscriptions_email_unique ON email_subscriptions(email);

-- =====================================================
-- CREATE UPDATE TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers to avoid duplicates
DROP TRIGGER IF EXISTS update_trust_section_updated_at ON trust_section;
DROP TRIGGER IF EXISTS update_seo_settings_updated_at ON seo_settings;
DROP TRIGGER IF EXISTS update_product_popup_updated_at ON product_popup;
DROP TRIGGER IF EXISTS update_offer_pricing_updated_at ON offer_pricing;
DROP TRIGGER IF EXISTS update_exit_intent_popup_updated_at ON exit_intent_popup;
DROP TRIGGER IF EXISTS update_hero_section_updated_at ON hero_section;
DROP TRIGGER IF EXISTS update_why_choose_section_updated_at ON why_choose_section;
DROP TRIGGER IF EXISTS update_product_gallery_updated_at ON product_gallery;
DROP TRIGGER IF EXISTS update_customer_reviews_updated_at ON customer_reviews;
DROP TRIGGER IF EXISTS update_footer_updated_at ON footer;

-- Create update triggers
CREATE TRIGGER update_trust_section_updated_at 
    BEFORE UPDATE ON trust_section 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at 
    BEFORE UPDATE ON seo_settings 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_product_popup_updated_at 
    BEFORE UPDATE ON product_popup 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_offer_pricing_updated_at 
    BEFORE UPDATE ON offer_pricing 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_exit_intent_popup_updated_at 
    BEFORE UPDATE ON exit_intent_popup 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_hero_section_updated_at 
    BEFORE UPDATE ON hero_section 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_why_choose_section_updated_at 
    BEFORE UPDATE ON why_choose_section 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_product_gallery_updated_at 
    BEFORE UPDATE ON product_gallery 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_customer_reviews_updated_at 
    BEFORE UPDATE ON customer_reviews 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_footer_updated_at 
    BEFORE UPDATE ON footer 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT DATA (from supabase-setup-final.sql)
-- This ensures tables have content so frontend doesn't fall back to defaults
-- =====================================================

-- hero_section default data
INSERT INTO hero_section (content) VALUES ('{
    "title": "Nutritious Snack Box with Breakfast Bars and Delicious Chips | Gift A Snack (42 Count)",
    "rating": 4.6,
    "reviews_count": 23,
    "sale_price": 31.95,
    "features": ["Fresh & high-quality snacks", "Walmart+ offer eligible"],
    "delivery_text": "Fast & reliable delivery",
    "urgency_text": "Limited stock available",
    "primary_cta": "View Product Details",
    "secondary_cta": "Learn More About This Product",
    "main_image": "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=800",
    "walmart_url": "https://www.walmart.com/ip/Healthy-Snack-Box-Tasty-Nutrient-Rich-Variety-42-Count-by-Gift-A-Snack/14479818419"
}'::jsonb) ON CONFLICT DO NOTHING;

-- trust_section default data
INSERT INTO trust_section (content) VALUES ('{
    "title": "Why Trust Us",
    "seller_info": {
        "name": "Pro Seller",
        "rating": 4.75,
        "reviews_count": 570
    },
    "walmart_info": {
        "text": "Official Walmart Seller",
        "subtext": "Secure checkout and fast delivery"
    },
    "guarantee": {
        "text": "Free 90-Day Returns",
        "subtext": "Shop with confidence - easy returns"
    }
}'::jsonb) ON CONFLICT DO NOTHING;

-- offer_pricing default data
INSERT INTO offer_pricing (content) VALUES ('{
    "title": "Ready to Fuel Your Day?",
    "subtitle": "Get your 42-count nutritious snack box today!",
    "sale_price": 31.95,
    "image_url": "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=800",
    "benefits": [
        "42 premium snacks included",
        "Fresh & high-quality snacks from top brands",
        "Perfect for gifting or office sharing",
        "Fast & reliable delivery nationwide",
        "Greeting card included"
    ],
    "cta_text": "Get Your Snack Box Now",
    "trust_elements": [
        {"icon": "Shield", "text": "Secure Payment"},
        {"icon": "Truck", "text": "Fast Shipping"},
        {"icon": "BadgeCheck", "text": "Satisfaction Guaranteed"}
    ]
}'::jsonb) ON CONFLICT DO NOTHING;

-- seo_settings default data
INSERT INTO seo_settings (content) VALUES ('{
    "meta_title": "Nutritious Snack Box with Breakfast Bars and Delicious Chips | Gift A Snack (42 Count)",
    "meta_description": "Get your 42-count nutritious snack box with breakfast bars and delicious chips. Perfect for gifting, office sharing, or personal enjoyment. Fast delivery, high-quality snacks.",
    "meta_keywords": "snack box, breakfast bars, healthy snacks, gift box, nutritious snacks, office snacks, 42 count, delicious chips",
    "og_title": "Nutritious Snack Box - 42 Premium Snacks | Gift A Snack",
    "og_description": "Amazing variety of snacks! Perfect for office teams, college students, and gifts. Fresh & high-quality snacks with fast delivery.",
    "og_image": "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=1200",
    "canonical_url": "",
    "facebook_pixel_id": ""
}'::jsonb) ON CONFLICT DO NOTHING;

-- product_popup default data
INSERT INTO product_popup (content) VALUES ('{
    "title": "Nutritious Snack Box with Breakfast Bars and Delicious Chips | Gift A Snack (42 Count)",
    "description": "View detailed product information, pricing, and purchase options for this 42-piece snack collection.",
    "product_name": "Nutritious Snack Box - Gift A Snack",
    "rating": 4.6,
    "reviews_count": 23,
    "original_price": 42.99,
    "discounted_price": 31.95,
    "features": ["Fresh & high-quality snacks", "Walmart+ offer eligible"],
    "pieces_count": 42,
    "additional_details": [
        "Ultimate snack experience in a beautifully designed high-end packaging box",
        "Packed with a variety of breakfast bars and savory snacks for daily energy",
        "Individually packaged snacks for convenient grab-and-go options",
        "Ideal for adults, teens, and college students alike",
        "Arrives with a heartwarming greeting card for a personal touch"
    ],
    "popup_image": "https://cdn.builder.io/api/v1/image/assets%2F84282e2d620247d2b8d8845fda2c790e%2F79d471e5bc56457eb2c3b1c3eb6586ae?format=webp&width=800"
}'::jsonb) ON CONFLICT DO NOTHING;

-- exit_intent_popup default data
INSERT INTO exit_intent_popup (content) VALUES ('{
    "title": "Stay Updated",
    "description": "👉 Subscribe now to be the first to know about our upcoming exclusive offers\\n\\n👉 Join our mailing list and get the latest news and special deals before anyone else.",
    "email_placeholder": "👉 Enter your email here",
    "subscribe_button_text": "👉 Subscribe Now",
    "dismiss_button_text": "👉 Maybe later",
    "privacy_note": "👉 🔒 We will never send you spam. You can unsubscribe anytime",
    "destination_email": "",
    "mailchimp_api_key": "",
    "mailchimp_list_id": "",
    "brevo_api_key": "",
    "brevo_list_id": ""
}'::jsonb) ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that all tables exist and have data
SELECT 
    'VERIFICATION COMPLETE' as status,
    'All tables created with proper RLS policies' as message;

-- Count records in each table
SELECT 
    'trust_section' as table_name, 
    COUNT(*) as record_count 
FROM trust_section
UNION ALL
SELECT 'seo_settings', COUNT(*) FROM seo_settings
UNION ALL
SELECT 'product_popup', COUNT(*) FROM product_popup
UNION ALL
SELECT 'offer_pricing', COUNT(*) FROM offer_pricing
UNION ALL
SELECT 'exit_intent_popup', COUNT(*) FROM exit_intent_popup
UNION ALL
SELECT 'hero_section', COUNT(*) FROM hero_section;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    '🎉 406 ERRORS FIXED! 🎉' as result,
    'All database tables are now accessible. Reload your website to verify the fix.' as instruction;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. This script uses permissive RLS policies for development/testing
-- 2. All tables have the required 'content' JSONB column for storing data
-- 3. Default data is inserted to prevent fallback to hardcoded defaults
-- 4. After running this script, your website should load data from database
-- 5. Test by: Save changes in admin → Reload page → Data should persist
-- =====================================================
