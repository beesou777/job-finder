# Vercel Deployment Guide

## Required Environment Variables

Add these environment variables in your Vercel project settings (Settings → Environment Variables):

### 1. Database Configuration
```
DATABASE_URL=postgresql://user:password@host:port/database
```
**Important:** Use your production database URL (Supabase, Vercel Postgres, or other PostgreSQL service)

### 2. NextAuth Configuration
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. API Configuration
```
NEXT_PUBLIC_API=https://your-domain.vercel.app
```

## Environment Variables Setup in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development** environments
4. Make sure to use your actual production domain for `NEXTAUTH_URL` and `NEXT_PUBLIC_API`

## Database Setup

### Option 1: Vercel Postgres (Recommended)
1. In Vercel dashboard, go to **Storage** → **Create Database** → **Postgres**
2. Copy the connection string and use it as `DATABASE_URL`
3. The connection string will look like: `postgres://default:password@host:5432/verceldb`

### Option 2: Supabase
1. Create a Supabase project
2. Go to **Settings** → **Database**
3. Copy the connection string (use the **Connection Pooling** URL for better performance)
4. Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### Option 3: Other PostgreSQL Services
- Railway
- Neon
- Render
- Any PostgreSQL-compatible database

## Important Notes

1. **Database Synchronization**: The app uses TypeORM `synchronize: false` in production for safety. Make sure your database schema is set up correctly.

2. **Connection Pooling**: The database configuration is optimized for serverless with:
   - Max connections: 1 (for serverless)
   - Connection timeout: 10 seconds
   - Idle timeout: 30 seconds

3. **First Deployment**: After deployment, you may need to:
   - Run database migrations manually, OR
   - Temporarily enable synchronize for initial setup (not recommended for production)

## Troubleshooting

### "There is a problem with the server configuration"
This usually means:
- Missing environment variables
- Incorrect `NEXTAUTH_URL` (must match your Vercel domain)
- Database connection issues

### "No Data Visible in Production"
This is usually caused by:

1. **Database Tables Not Created**
   - Check Vercel logs for "Missing tables" warnings
   - Solution: Temporarily set `DATABASE_SYNC=true`, redeploy, then remove it
   - Or check schema: `POST /api/db/init` with admin password

2. **Empty Database**
   - Your production database might be empty
   - Solution: Run scraper or import data
   - Use dashboard or API: `POST /api/scrape` with admin password

3. **Environment Variables Not Set**
   - Verify `NEXT_PUBLIC_API` is set to your production URL
   - Verify `DATABASE_URL` is correct
   - Check Vercel environment variables are set for Production environment

4. **API Fetch Errors**
   - Check browser console for fetch errors
   - Check Vercel function logs for API errors
   - Verify `NEXT_PUBLIC_API` matches your domain exactly

5. **Database Connection Issues**
   - Check if database allows connections from Vercel
   - Verify connection string format
   - Check database is not paused (Supabase free tier pauses after inactivity)

### Database Connection Errors
1. Verify `DATABASE_URL` is correct
2. Check if your database allows connections from Vercel's IPs
3. For Supabase, ensure you're using the **Connection Pooling** port (6543) not direct connection (5432)

### NextAuth Errors
1. Ensure `NEXTAUTH_SECRET` is set and is a secure random string
2. `NEXTAUTH_URL` must exactly match your Vercel deployment URL (including https://)
3. Check Vercel logs for specific error messages

## Post-Deployment Steps

1. **Initialize Database Schema** (IMPORTANT):
   - If tables don't exist, you have two options:
   
   **Option A: Temporary Synchronize (Quick Fix)**
   - In Vercel, add environment variable: `DATABASE_SYNC=true`
   - Redeploy your application
   - Once tables are created, **REMOVE** `DATABASE_SYNC` or set it to `false`
   - ⚠️ **Warning**: Only use this for initial setup. Remove it after first deployment!
   
   **Option B: Check Schema Status**
   - Call the init endpoint: `POST https://your-app.vercel.app/api/db/init`
   - Headers: `Authorization: Bearer your-admin-password`
   - This will tell you which tables are missing

2. **Create Admin User**: Use the registration API or run the init script locally pointing to production DB
3. **Test Database Connection**: Visit any page that uses the database
4. **Check Logs**: Monitor Vercel function logs for any errors
5. **Verify Data**: Make sure you've scraped jobs or imported data into production database

## Example Environment Variables

```env
# Production
DATABASE_URL=postgresql://postgres.user:password@aws-0-region.pooler.supabase.com:6543/postgres
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here
NEXT_PUBLIC_API=https://your-app.vercel.app
```

## Security Checklist

- [ ] All environment variables are set in Vercel
- [ ] `NEXTAUTH_SECRET` is a secure random string
- [ ] Database credentials are secure
- [ ] `NEXTAUTH_URL` matches your production domain
- [ ] Database allows connections from Vercel

