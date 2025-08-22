-- =====================================================
-- FIX RLS POLICIES FOR PROPER DATA SYNC
-- This script temporarily makes RLS policies more permissive
-- to allow proper testing of the admin dashboard
-- =====================================================

-- Fix trust_section policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON trust_section;
DROP POLICY IF EXISTS "Enable all operations for all users" ON trust_section;

-- Create more permissive policy for testing (allows unauthenticated writes)
CREATE POLICY "Enable all operations for all users" ON trust_section FOR ALL USING (true);

-- Fix product_gallery policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON product_gallery;
DROP POLICY IF EXISTS "Enable all operations for all users" ON product_gallery;

CREATE POLICY "Enable all operations for all users" ON product_gallery FOR ALL USING (true);

-- Fix customer_reviews policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON customer_reviews;
DROP POLICY IF EXISTS "Enable all operations for all users" ON customer_reviews;

CREATE POLICY "Enable all operations for all users" ON customer_reviews FOR ALL USING (true);

-- Fix hero_section policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON hero_section;
DROP POLICY IF EXISTS "Enable all operations for all users" ON hero_section;

CREATE POLICY "Enable all operations for all users" ON hero_section FOR ALL USING (true);

-- Fix why_choose_section policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON why_choose_section;
DROP POLICY IF EXISTS "Enable all operations for all users" ON why_choose_section;

CREATE POLICY "Enable all operations for all users" ON why_choose_section FOR ALL USING (true);

-- Fix offer_pricing policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON offer_pricing;
DROP POLICY IF EXISTS "Enable all operations for all users" ON offer_pricing;

CREATE POLICY "Enable all operations for all users" ON offer_pricing FOR ALL USING (true);

-- Fix footer policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON footer;
DROP POLICY IF EXISTS "Enable all operations for all users" ON footer;

CREATE POLICY "Enable all operations for all users" ON footer FOR ALL USING (true);

-- Fix seo_settings policies  
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON seo_settings;
DROP POLICY IF EXISTS "Enable all operations for all users" ON seo_settings;

CREATE POLICY "Enable all operations for all users" ON seo_settings FOR ALL USING (true);

-- Fix product_popup policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON product_popup;
DROP POLICY IF EXISTS "Enable all operations for all users" ON product_popup;

CREATE POLICY "Enable all operations for all users" ON product_popup FOR ALL USING (true);

-- Fix exit_intent_popup policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON exit_intent_popup;
DROP POLICY IF EXISTS "Enable all operations for all users" ON exit_intent_popup;

CREATE POLICY "Enable all operations for all users" ON exit_intent_popup FOR ALL USING (true);

-- IMPORTANT: After testing is complete, you should revert to authenticated-only policies:
-- 
-- Example to revert to secure policies:
-- DROP POLICY "Enable all operations for all users" ON trust_section;
-- CREATE POLICY "Enable all operations for authenticated users" ON trust_section FOR ALL USING (auth.role() = 'authenticated');
--
-- This ensures security in production while allowing testing in development
