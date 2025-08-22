# Supabase Setup and Troubleshooting Guide

## 🚀 Quick Start

Your project is now configured with the correct Supabase credentials:

- **URL**: `https://lzfpvyzlndxsceheghtf.supabase.co`
- **Environment variables**: Set via DevServerControl

## 📋 Step-by-Step Setup

### 1. Database Schema Setup

**Option A: Full Setup with Sample Data (Recommended)**

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/lzfpvyzlndxsceheghtf/sql)
2. Copy the entire content of `supabase-setup-final.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute

**Option B: Tables Only (No Sample Data)**
Use the SQL script from the SupabaseSetupTest component (available in the admin dashboard).

### 2. Verify Setup

**Using the React App (Recommended)**:

1. Start your dev server: `npm run dev`
2. Go to `/admin` route
3. Look for the "Supabase Setup Test" component
4. Run the tests to verify everything is working

**Alternative - Using Test Scripts**:

```bash
# Test database connectivity (if Node.js commands are allowed)
node test-database-connectivity.js

# Test real-time sync
node test-realtime-sync.js
```

### 3. Authentication Setup

The app currently allows any authenticated user to be an admin. To set up proper admin authentication:

1. **Create an admin user**:

   ```sql
   -- Run in Supabase SQL Editor
   CREATE TABLE IF NOT EXISTS admin_users (
       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
       email VARCHAR(255) NOT NULL,
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Enable read for service role" ON admin_users FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');
   CREATE POLICY "Enable all for service role" ON admin_users FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
   ```

2. **Update the authentication logic** in `client/hooks/use-supabase-admin-auth.tsx`:
   - Uncomment the admin_users table check in the `checkAdminAccess` function
   - Remove the `return true;` line that currently allows all users

## 🔧 Troubleshooting

### Common Issues

**1. "Connection failed" or "Missing tables"**

- Run the SQL setup script from `supabase-setup-final.sql`
- Check that your Supabase project is active
- Verify environment variables are set correctly

**2. "Real-time not working"**

- Real-time subscriptions require proper RLS policies
- Make sure tables have the correct policies set up
- Check browser console for subscription errors

**3. "Authentication failed"**

- Verify SUPABASE_ANON_KEY is correct
- Check that auth.users table exists
- Ensure admin_users table is set up if using admin authentication

**4. "Insert/Update failed"**

- Check RLS policies allow the operation
- Verify user is properly authenticated
- Use service role key for admin operations

### RLS Policy Issues

If you're having permission issues, you can temporarily use the permissive policies from `fix-rls-policies.sql`:

⚠️ **Warning**: Only use this in development - it allows unauthenticated writes!

```sql
-- Run this to make policies permissive (DEV ONLY)
-- Copy content from fix-rls-policies.sql
```

To revert to secure policies:

```sql
-- Example for one table (repeat for all tables)
DROP POLICY "Enable all operations for all users" ON hero_section;
CREATE POLICY "Enable all operations for authenticated users" ON hero_section FOR ALL USING (auth.role() = 'authenticated');
```

### Real-time Sync Issues

1. **Check subscription status**:

   ```javascript
   const channel = supabase
     .channel("test")
     .on(
       "postgres_changes",
       { event: "*", schema: "public", table: "hero_section" },
       (payload) => {
         console.log("Real-time update:", payload);
       },
     )
     .subscribe((status) => {
       console.log("Subscription status:", status);
     });
   ```

2. **Verify policies allow real-time**:
   - Tables need SELECT policies for real-time to work
   - Real-time only works for authenticated users in secure setups

3. **Check browser console**:
   - Look for WebSocket connection errors
   - Check for authentication issues

## 🔐 Security Best Practices

### Production Setup

1. **Use proper RLS policies**:

   ```sql
   -- Read access for everyone
   CREATE POLICY "public_read" ON table_name FOR SELECT USING (true);

   -- Write access only for authenticated users
   CREATE POLICY "authenticated_write" ON table_name FOR ALL USING (auth.role() = 'authenticated');

   -- Full access for service role
   CREATE POLICY "service_role_all" ON table_name FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
   ```

2. **Admin user management**:
   - Create a proper admin_users table
   - Link admin users to auth.users via user_id
   - Implement proper role-based access control

3. **Environment variables**:
   - Never commit service role keys to git
   - Use different keys for different environments
   - Rotate keys regularly

## 📊 Monitoring and Logs

### Supabase Dashboard Links

- [Main Dashboard](https://supabase.com/dashboard/project/lzfpvyzlndxsceheghtf)
- [SQL Editor](https://supabase.com/dashboard/project/lzfpvyzlndxsceheghtf/sql)
- [Database](https://supabase.com/dashboard/project/lzfpvyzlndxsceheghtf/database/tables)
- [Authentication](https://supabase.com/dashboard/project/lzfpvyzlndxsceheghtf/auth/users)
- [Storage](https://supabase.com/dashboard/project/lzfpvyzlndxsceheghtf/storage/buckets)
- [Logs](https://supabase.com/dashboard/project/lzfpvyzlndxsceheghtf/logs)

### Debugging Tools

1. **Use the SupabaseSetupTest component** (in `/admin`)
2. **Check browser console** for real-time errors
3. **Monitor Supabase logs** in the dashboard
4. **Use the database debugger** components in the admin panel

## 🎯 Expected Behavior

When everything is set up correctly:

1. ✅ Frontend loads without database errors
2. ✅ Admin panel shows all content sections
3. ✅ Changes in admin panel appear immediately on frontend
4. ✅ Real-time updates work across multiple browser tabs
5. ✅ Authentication works properly
6. ✅ No "DatabaseFixPanel" popups appear

## 🆘 Need Help?

1. Check the SupabaseSetupTest component results
2. Review the browser console for errors
3. Check Supabase dashboard logs
4. Verify all environment variables are set
5. Ensure SQL setup script was run completely

If issues persist, the problem is likely:

- Incomplete SQL setup
- Missing environment variables
- RLS policy configuration
- Authentication setup issues
