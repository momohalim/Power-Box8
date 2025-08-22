# Customer Reviews Image Upload - Testing Guide

## 🎯 Feature Overview
This feature allows uploading custom profile images for each of the 6 customer review cards. Images are stored in Supabase Storage and displayed on the frontend instead of placeholder images.

## 🔧 Setup Requirements

### Step 1: Create Storage Bucket
Run this SQL script in your Supabase Dashboard → SQL Editor:

```sql
-- Copy and paste the contents of customer-reviews-storage-setup.sql
```

Or copy the SQL from the `customer-reviews-storage-setup.sql` file created in the project root.

### Step 2: Verify Environment Variables
Ensure these are set in your environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)

## 🧪 Testing Checklist

### Admin Panel Testing (`/admin/testimonials`)

#### Image Upload Testing
- [ ] **Access Admin Panel**: Go to `/admin/testimonials`
- [ ] **See 6 Review Cards**: Each card should have an image upload section
- [ ] **Upload Image for Review 1**:
  - Click "Upload Image" button
  - Select a JPG/PNG image (under 5MB)
  - ✅ **Success**: Image appears as circular preview
  - ✅ **Success**: Success notification shows
- [ ] **Upload Images for All 6 Reviews**: Repeat for reviews 2-6
- [ ] **Replace Image**: Click "Replace" button and upload different image
- [ ] **Remove Image**: Click "Remove" button to delete image
- [ ] **URL Input**: Enter image URL manually in text field

#### Image Validation Testing
- [ ] **Large File**: Try uploading file > 5MB (should show error)
- [ ] **Invalid Format**: Try uploading .txt or .pdf file (should show error)
- [ ] **Network Error**: Disconnect internet and try upload (should show error)

#### Save and Persistence Testing
- [ ] **Save Changes**: Click "Save Changes" button
- [ ] **Success Notification**: Should see "Customer Reviews section saved" message
- [ ] **Reload Admin Page**: Refresh `/admin/testimonials`
- [ ] ✅ **Success**: All uploaded images should still be visible
- [ ] **Edit Other Fields**: Change review text, name, rating
- [ ] **Save Again**: Images should persist with other changes

### Frontend Display Testing

#### Customer Reviews Section
- [ ] **Go to Main Website**: Navigate to home page
- [ ] **Scroll to Reviews Section**: Find "What Our Customers Say" section
- [ ] **Check Image Display**: 
  - ✅ **Success**: Uploaded images appear in review cards
  - ✅ **Success**: Images are circular and properly sized
  - ✅ **Success**: Fallback to placeholder if no image uploaded
- [ ] **Reload Page**: Refresh the main website
- [ ] ✅ **Success**: All uploaded images should persist

#### Image Error Handling
- [ ] **Invalid Image URL**: In admin, enter broken URL and save
- [ ] **Frontend Fallback**: Should display placeholder image instead
- [ ] **Network Issues**: Temporarily block image domain
- [ ] **Graceful Degradation**: Should show placeholder on error

### Data Structure Testing

#### Database Verification
Check in Supabase Dashboard → Table Editor → `customer_reviews`:
- [ ] **Content Column**: Should contain JSONB with `image` field for each review
- [ ] **Image URLs**: Should show Supabase storage URLs like:
  ```
  https://your-project.supabase.co/storage/v1/object/public/customer_reviews/customer_reviews-123456-abc.jpg
  ```

#### Storage Bucket Verification
Check in Supabase Dashboard → Storage → `customer_reviews`:
- [ ] **Uploaded Files**: Should see all uploaded image files
- [ ] **File Names**: Should follow format: `customer_reviews-timestamp-random.jpg`
- [ ] **Public Access**: Files should be publicly accessible

## 🔄 End-to-End Workflow Test

### Complete User Journey
1. **Upload Images**: Go to admin panel, upload 6 different images
2. **Save Changes**: Click save and verify success notification
3. **View Frontend**: Go to main website, verify all images display
4. **Edit Content**: Return to admin, change review text
5. **Save Again**: Verify images persist with text changes
6. **Reload Everything**: Refresh both admin and frontend
7. **Verify Persistence**: All images and content should remain

### Expected Results
✅ **Admin Panel**:
- Each review card shows uploaded image preview
- Upload/replace/remove buttons work correctly
- Images persist after save and reload

✅ **Frontend**:
- Customer review cards display uploaded images
- Images are properly sized and styled
- Fallback to placeholders when no image uploaded
- Images persist across page reloads

✅ **Database**:
- JSONB content includes `image` field with URLs
- Supabase storage contains uploaded files
- Real-time updates work between admin and frontend

## 🐛 Troubleshooting

### Common Issues

#### Upload Fails
**Problem**: Image upload shows error message
**Solutions**:
1. Check file size (must be < 5MB)
2. Check file format (JPG, PNG, GIF, WebP only)
3. Verify Supabase connection
4. Check browser network tab for 403/404 errors

#### Images Don't Persist
**Problem**: Images disappear after reload
**Solutions**:
1. Ensure "Save Changes" was clicked in admin
2. Check database content has `image` field
3. Verify storage bucket permissions
4. Check browser console for errors

#### Images Don't Display on Frontend
**Problem**: Frontend shows placeholder images
**Solutions**:
1. Verify images are saved in database
2. Check image URLs are accessible
3. Test URLs directly in browser
4. Check browser console for CORS errors

#### Storage Bucket Issues
**Problem**: Cannot upload to storage
**Solutions**:
1. Run the storage setup SQL script
2. Check bucket exists in Supabase dashboard
3. Verify RLS policies allow uploads
4. Test with Supabase anon key

### Debug Information

#### Admin Panel Debug
- Open browser console while uploading
- Look for success/error messages
- Check network tab for storage API calls

#### Frontend Debug
- Check if image URLs are valid
- Verify `reviewsData.reviews[].image` contains URLs
- Test image URLs directly in browser

#### Database Debug
```sql
-- Check customer_reviews content
SELECT content FROM customer_reviews;

-- Check for image field in reviews
SELECT content->'reviews'->0->'image' as first_review_image 
FROM customer_reviews;
```

#### Storage Debug
```sql
-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'customer_reviews';

-- Check uploaded objects
SELECT * FROM storage.objects WHERE bucket_id = 'customer_reviews';
```

## 📝 Success Criteria

### Feature Complete When:
- [ ] All 6 review cards support image upload
- [ ] Images upload to `customer_reviews` Supabase bucket
- [ ] Image URLs stored in database JSONB `content.reviews[].image`
- [ ] Frontend displays uploaded images in review cards
- [ ] Images persist after page reload
- [ ] Fallback to placeholder images when none uploaded
- [ ] Proper error handling for upload failures
- [ ] Admin UI provides clear feedback on upload status

### Performance Requirements:
- [ ] Image upload completes within 10 seconds
- [ ] Frontend loads review images without delay
- [ ] No impact on page load performance
- [ ] Graceful degradation on slow connections

This comprehensive testing ensures the customer reviews image upload feature works reliably across all use cases.
