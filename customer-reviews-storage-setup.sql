-- =====================================================
-- CUSTOMER REVIEWS STORAGE BUCKET SETUP
-- This script creates the storage bucket for customer review images
-- =====================================================

-- Create the customer_reviews storage bucket (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'customer_reviews', 
    'customer_reviews', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public read access for customer_reviews bucket" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access to customer_reviews bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to customer_reviews bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update in customer_reviews bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete from customer_reviews bucket" ON storage.objects;

-- Create comprehensive storage policies for customer_reviews bucket
CREATE POLICY "Public read access for customer_reviews bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'customer_reviews');

CREATE POLICY "Service role full access to customer_reviews bucket" 
ON storage.objects FOR ALL 
USING (bucket_id = 'customer_reviews' AND auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Authenticated upload to customer_reviews bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'customer_reviews' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update in customer_reviews bucket" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'customer_reviews' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete from customer_reviews bucket" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'customer_reviews' AND auth.role() = 'authenticated');

-- Verify the bucket was created successfully
SELECT 
    'SUCCESS: customer_reviews bucket created!' as result,
    name as bucket_name,
    public as is_public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'customer_reviews';

-- =====================================================
-- TESTING VERIFICATION
-- You can test the setup by uploading an image through the admin panel
-- The URL format will be: https://your-project.supabase.co/storage/v1/object/public/customer_reviews/filename.jpg
-- =====================================================
