# Database 406 Error Fix - Testing Instructions

## 🚨 Problem Summary
Data changes save successfully but revert to default values after page reload due to 406 "Not Acceptable" errors when fetching from these tables:
- `trust_section`
- `seo_settings` 
- `product_popup`
- `offer_pricing`
- `exit_intent_popup`

## 🔧 Solution Applied
1. **Database Diagnosis Tools**: Added comprehensive debugging components
2. **406 Error Fix Script**: Created `fix-406-database-issues.sql` with all required tables and RLS policies
3. **Auto-Detection**: Website now automatically detects 406 errors and shows fix instructions
4. **Admin Tools**: Added database diagnosis to admin dashboard for testing

## 📋 Step-by-Step Fix Instructions

### Step 1: Identify the Issue
1. Load the website - you should see a red banner at the top if 406 errors are detected
2. Check browser console for 406 errors on table fetches
3. Go to `/admin` to see the detailed database diagnosis

### Step 2: Apply the Fix
1. **Option A: Use the auto-generated SQL fix**
   - Click "Copy Fix SQL" from the red banner on the website
   - Go to Supabase Dashboard → SQL Editor
   - Paste and run the SQL script
   
2. **Option B: Use the comprehensive fix script**
   - Copy the contents of `fix-406-database-issues.sql` 
   - Go to Supabase Dashboard → SQL Editor
   - Paste and run the entire script

### Step 3: Verify the Fix
1. **Check Admin Dashboard**
   - Go to `/admin` 
   - Look at the "Database Status & Fix Tool" section
   - All tables should show green "✓ Accessible" status

2. **Test Auto-Detection**
   - Reload the main website
   - The red 406 error banner should disappear
   - No more 406 errors in browser console

3. **Test Save-Reload Workflow**
   - Go to any admin section (e.g., `/admin/hero`)
   - Make changes to the content
   - Click "Save Changes" 
   - ✅ **Success**: You should see "saved successfully" message
   - Reload the page
   - ✅ **Success**: Your changes should persist (not revert to defaults)

## 🧪 Comprehensive Testing Checklist

### Database Connectivity Tests
- [ ] All tables accessible without 406 errors
- [ ] Content JSONB column exists in all tables
- [ ] RLS policies allow read/write operations
- [ ] Default data is present to prevent fallbacks

### Admin Panel Tests
Test each admin section saves and reloads properly:
- [ ] **Hero Section** (`/admin/hero`)
  - Change title, price, features
  - Save → Reload → Changes persist
- [ ] **Trust Section** (`/admin/walmart`) 
  - Change seller info, ratings
  - Save → Reload → Changes persist
- [ ] **SEO Settings** (`/admin/seo`)
  - Change meta title, description
  - Save → Reload → Changes persist
- [ ] **Offer Pricing** (`/admin/offer-pricing`)
  - Change title, price, benefits
  - Save → Reload → Changes persist
- [ ] **Popups** (`/admin/popups`)
  - Change popup content
  - Save → Reload → Changes persist

### Frontend Display Tests
- [ ] Main website loads without 406 errors
- [ ] All sections display database content (not hardcoded defaults)
- [ ] Real-time updates work between admin and frontend
- [ ] No red error banners appear after fix

## 🔍 Debugging Tools Available

### 1. Database 406 Fix Banner
- **Location**: Appears at top of main website when issues detected
- **Purpose**: Auto-detects 406 errors and provides quick fix SQL
- **Action**: Click "Copy Fix SQL" → Run in Supabase

### 2. Database Diagnosis (Admin)
- **Location**: `/admin` → "Database Status & Fix Tool" section  
- **Purpose**: Detailed status of each table with error codes
- **Features**: Shows working/broken tables, generates fix SQL

### 3. Database Fix Panel
- **Location**: Appears automatically when database issues detected
- **Purpose**: General database setup guidance
- **Action**: Provides copy-paste SQL fixes

### 4. Browser Console
- **Purpose**: Shows actual 406 HTTP errors with details
- **How to check**: F12 → Console → Look for red 406 errors on table fetches

## ⚡ Quick Verification Commands

After applying the fix, you can verify it worked by checking these in Supabase SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('trust_section', 'seo_settings', 'product_popup', 'offer_pricing', 'exit_intent_popup');

-- Check tables have content column
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'content' 
AND table_name IN ('trust_section', 'seo_settings', 'product_popup', 'offer_pricing', 'exit_intent_popup');

-- Check tables have data
SELECT 'trust_section' as table_name, COUNT(*) as records FROM trust_section
UNION ALL
SELECT 'seo_settings', COUNT(*) FROM seo_settings  
UNION ALL
SELECT 'product_popup', COUNT(*) FROM product_popup
UNION ALL  
SELECT 'offer_pricing', COUNT(*) FROM offer_pricing
UNION ALL
SELECT 'exit_intent_popup', COUNT(*) FROM exit_intent_popup;
```

## 🎯 Expected Results After Fix

### ✅ Success Indicators
- No 406 errors in browser console
- No red error banners on website
- Admin dashboard shows all tables as "✓ Accessible"
- Data saves and persists after page reload
- Frontend shows database content, not hardcoded defaults

### ❌ If Issues Persist
1. **Check environment variables**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
2. **Check RLS policies**: Verify policies allow anonymous access for reads
3. **Check table structure**: Ensure all tables have `content JSONB` column
4. **Check network**: Verify Supabase is accessible (not blocked)

## 📞 Support
If issues persist after following these instructions:
1. Check the browser console for specific error messages
2. Use the admin diagnosis tool to see detailed table status
3. Verify the SQL fix script ran without errors in Supabase
4. Test with a simple table read operation in Supabase SQL Editor

The fix should resolve all 406 errors and enable proper data persistence throughout the application.
