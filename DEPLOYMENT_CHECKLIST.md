# Watercooler Site Deployment Checklist

**⚠️ IMPORTANT: This is an UPDATE to an existing Vercel deployment**

The watercooler-site is already deployed at `watercoolerdev.com`. This checklist covers updating the existing deployment to add authentication, database, and dashboard features.

## Prerequisites

- [ ] Vercel account with access to existing `watercooler-site` project
- [ ] GitHub account with access to `mostlyharmless-ai/watercooler-site` repository
- [ ] Node.js 18+ and pnpm installed locally (for testing)
- [ ] `openssl` installed (for generating secrets)

## Phase 1: Verify & Update Existing Vercel Project

### 1.1 Locate Existing Project

- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Find the existing `watercooler-site` project (or `watercooler-landing`)
- [ ] Verify it's connected to `mostlyharmless-ai/watercooler-site` repository
- [ ] Note the current deployment URL (likely `watercoolerdev.com` or `watercooler-site.vercel.app`)

### 1.2 Update Build Configuration

**Current State**: The site is a static Next.js landing page with simple build  
**New State**: Requires Prisma database migrations during build

- [ ] Go to **Settings** → **Build and Deployment** (top-level menu item in Settings sidebar)
- [ ] Verify **Framework Preset** is set to `Next.js`
- [ ] Check **Root Directory** is `/` (should be root of repo)
- [ ] **Update Build Command** (if Override toggle is enabled):
  - Current: Likely shows `pnpm build`
  - **Action Required**: Change to one of these options:
    - **Option A (Recommended)**: `pnpm vercel-build` 
      - This uses the script from `package.json` which includes Prisma steps
    - **Option B**: `pnpm prisma generate && pnpm prisma migrate deploy && pnpm build`
      - This matches what's in `vercel.json` exactly
  - **Note**: If Override toggle is disabled, `vercel.json` will be used automatically
- [ ] Verify **Output Directory** is `.next` or "Next.js default" (default)
- [ ] Verify **Install Command** is `pnpm install` (should already be set)
- [ ] **Important**: The Build Command must include Prisma steps (`prisma generate` and `prisma migrate deploy`) before `next build`

### 1.3 Verify vercel.json Configuration

The repository now includes `vercel.json` with:
```json
{
  "buildCommand": "pnpm prisma generate && pnpm prisma migrate deploy && pnpm build",
  "installCommand": "pnpm install"
}
```

- [ ] Verify `vercel.json` is committed to the repository
- [ ] **Note**: Vercel will use `vercel.json` buildCommand if present, overriding package.json scripts
- [ ] If you prefer using `package.json` scripts, you can remove `buildCommand` from `vercel.json` and rely on `vercel-build` script

### 1.4 Check Existing Environment Variables

- [ ] Go to **Settings** → **Environment Variables**
- [ ] Review existing variables (if any)
- [ ] **Note**: The site previously had no database/auth, so likely no env vars exist yet
- [ ] Document any existing variables that might conflict with new ones

## Phase 2: Database Setup (Postgres via Marketplace)

**Note**: Vercel no longer offers direct Postgres. You'll use a marketplace provider.

### 2.1 Choose Postgres Provider

**Recommended Options:**

**Option A: Neon (Recommended)**
- ✅ Serverless Postgres
- ✅ Free tier available (generous limits)
- ✅ Easy integration with Vercel
- ✅ Automatic connection string setup
- ✅ Good performance and reliability

**Option B: Supabase**
- ✅ Postgres backend
- ✅ Free tier available
- ✅ Additional features (auth, storage, etc.)
- ✅ Good developer experience

**Option C: Prisma Postgres**
- ✅ Instant Serverless Postgres
- ✅ Optimized for Prisma
- ✅ Good for Prisma-based projects

**Recommendation**: Use **Neon** for simplicity and reliability.

### 2.2 Create Database via Marketplace

- [ ] In Vercel project dashboard, go to **Storage** tab
- [ ] Click **Create Database** or **Browse Storage**
- [ ] Select **"Create New"** tab
- [ ] Scroll to **"Marketplace Database Providers"** section
- [ ] Click on **Neon** (or your chosen provider)
- [ ] Follow the provider's setup flow:
  - Sign in/up with the provider (if needed)
  - Create a new database
  - Choose region (closest to your users)
  - **Important**: Leave **"Auth" toggle OFF** (disabled)
    - Neon's Auth is their built-in authentication system
    - We're using NextAuth.js with GitHub OAuth instead
    - We don't need Neon's auth features
  - Select plan (Free tier recommended for development)
- [ ] Complete the integration setup

### 2.3 Configure Database Connection

After creating the database, you'll see a "Configure [project-name]" modal:

**Environments Section:**
- [ ] Verify all three environments are checked:
  - ✅ Development
  - ✅ Preview  
  - ✅ Production
- [ ] **Keep all checked** - database should be available in all environments

**Create Database Branch For Deployment:**
- [ ] Leave both unchecked for now:
  - Preview (unchecked)
  - Production (unchecked)
- [ ] **Note**: This is a Neon feature for separate database branches per environment. Not needed for initial setup.

**Custom Prefix (IMPORTANT!):**
- [ ] **Change the prefix from "STORAGE" to empty or "DATABASE"**
  - Current default: `STORAGE_URL` (wrong - Prisma expects `DATABASE_URL`)
  - **Action**: Clear the prefix field or set it to `DATABASE`
  - This ensures the environment variable is named `DATABASE_URL` (what Prisma/NextAuth expects)
- [ ] If you leave it as "STORAGE", you'll get `STORAGE_URL` and need to manually rename it later

**Complete Connection:**
- [ ] Click **"Connect"** button
- [ ] Wait for connection to be established

### 2.4 Verify Database Connection String

- [ ] Go to **Settings** → **Environment Variables**
- [ ] Verify `DATABASE_URL` appears (not `STORAGE_URL`)
- [ ] Connection string format should be: `postgresql://user:password@host:port/database?sslmode=require`
- [ ] Verify it's enabled for all three environments (Development, Preview, Production)

**For Supabase:**
- [ ] Go to Supabase project → Settings → Database
- [ ] Copy the connection string (URI format)
- [ ] Add as `DATABASE_URL` in Vercel environment variables

**For Prisma Postgres:**
- [ ] Connection string should be auto-provided
- [ ] Verify it appears in Vercel environment variables

### 2.4 Verify Database Connection

- [ ] Verify `DATABASE_URL` appears in **Settings** → **Environment Variables**
- [ ] Connection string format should be: `postgresql://user:password@host:port/database?sslmode=require`
- [ ] Test connection locally (optional):
  ```bash
  # With DATABASE_URL in .env.local
  pnpm prisma db pull  # Test connection
  ```

## Phase 3: Environment Variables Configuration

### 3.1 Generate Required Secrets

Run these commands locally to generate secure secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32
```

**Save these values securely** - you'll need them in the next step.

### 3.2 Set Environment Variables in Vercel

Go to **Settings** → **Environment Variables** and add:

- [ ] **`DATABASE_URL`**
  - Value: From marketplace provider (Neon/Supabase/etc.) - may be auto-added or need manual setup
  - Environments: Production, Preview, Development
  - **Note**: Provider may auto-add this, or you may need to copy from provider dashboard

- [ ] **`NEXTAUTH_URL`**
  - Value: Your production URL (e.g., `https://watercoolerdev.com` or `https://watercooler-site.vercel.app`)
  - Environments: Production, Preview, Development
  - **Note**: For preview deployments, Vercel provides `VERCEL_URL` automatically

- [ ] **`NEXTAUTH_SECRET`**
  - Value: Generated secret from step 3.1
  - Environments: Production, Preview, Development

- [ ] **`GITHUB_CLIENT_ID`**
  - Value: From GitHub OAuth App (see Phase 4)
  - Environments: Production, Preview, Development

- [ ] **`GITHUB_CLIENT_SECRET`**
  - Value: From GitHub OAuth App (see Phase 4)
  - Environments: Production, Preview, Development

- [ ] **`ENCRYPTION_KEY`**
  - Value: Generated secret from step 3.1
  - Environments: Production, Preview, Development

- [ ] **`WATERCOOLER_THREADS_BASE`** (Optional)
  - Value: Default threads directory path (e.g., `~/.watercooler-threads`)
  - Environments: Production, Preview, Development

### 3.3 Verify Environment Variables

- [ ] All 6 required variables are set
- [ ] Each variable is enabled for Production, Preview, and Development
- [ ] No typos in variable names (case-sensitive)

## Phase 4: GitHub OAuth App Setup

### 4.1 Create GitHub OAuth App

- [ ] Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps**
- [ ] Click **New OAuth App**
- [ ] Fill in the form:
  - **Application name**: `Watercooler`
  - **Homepage URL**: Your production URL: `https://watercoolerdev.com`
  - **Authorization callback URL**: `https://watercoolerdev.com/api/auth/callback/github`
    - **Note**: For preview deployments, use: `https://watercooler-site.vercel.app/api/auth/callback/github`
- [ ] Click **Register application**

### 4.2 Get OAuth Credentials

- [ ] After creating the app, you'll see:
  - **Client ID** (public, can be in code)
  - **Client Secret** (private, must be in env vars)
- [ ] Copy **Client ID** → Add to Vercel as `GITHUB_CLIENT_ID`
- [ ] Click **Generate a new client secret** → Copy → Add to Vercel as `GITHUB_CLIENT_SECRET`
- [ ] **Important**: Save the client secret immediately - you can only see it once!

### 4.3 Verify OAuth Scopes

The app requests these scopes (configured in `lib/auth.ts`):
- `read:user` - Read user profile
- `user:email` - Read user email
- `repo` - Full repository access

- [ ] Verify these scopes are appropriate for your use case
- [ ] Users will be prompted to authorize these permissions on first login

## Phase 5: Database Migrations

### 5.1 Initial Migration

The first deployment will run migrations automatically via `vercel-build` script.

**For manual testing (optional):**

```bash
# Locally, with DATABASE_URL set:
pnpm prisma generate
pnpm prisma migrate deploy
```

### 5.2 Verify Migration Success

- [ ] Check Vercel build logs for:
  - `Running "prisma generate"`
  - `Running "prisma migrate deploy"`
  - No migration errors
- [ ] Verify database tables exist:

  **Option A: Using Prisma Studio (Recommended - Visual Browser Tool)**
  ```bash
  export DATABASE_URL="your-connection-string"
  pnpm prisma studio
  ```
  - Opens browser at `http://localhost:5555`
  - You'll see all tables listed in the left sidebar
  - Verify these tables exist:
    - `User`
    - `Account`
    - `Session`
    - `VerificationToken`
    - `GitHubToken`
    - `UserPreferences`

  **Option B: Using Neon Dashboard**
  - Click **"Open in Neon"** button on Vercel Storage page
  - In Neon dashboard, go to **SQL Editor**
  - Run query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
  - Verify all 6 tables are listed

  **Option C: Using psql (Command Line)**
  ```bash
  # Get connection string from Vercel Storage page (.env.local tab, click "Show secret")
  psql "your-database-url"
  \dt  # List all tables
  ```

## Phase 6: Deploy Updated Site

### 6.1 Trigger Deployment

**Important**: This will update the existing live site. Consider deploying to a preview first.

**Option A: Preview Deployment (Recommended for first update)**
- [ ] Create a feature branch (e.g., `feature/auth-dashboard`)
- [ ] Push changes to GitHub
- [ ] Vercel will automatically create a preview deployment
- [ ] Test the preview deployment URL
- [ ] Verify authentication and database work correctly
- [ ] Merge to main when ready

**Option B: Direct Production Deployment**
- [ ] Push to main branch (if auto-deploy enabled)
- [ ] Or manually deploy from Vercel dashboard:
  - Go to **Deployments** tab
  - Click **Deploy** → Select branch → **Deploy**

### 6.2 Monitor Build Process

Watch the build logs carefully - this is the first build with Prisma:

- [ ] Dependencies install successfully (new packages: `prisma`, `@prisma/client`, `next-auth`, etc.)
- [ ] `postinstall` script runs (`prisma generate`) - **NEW**
- [ ] Build command runs (from `vercel.json` or `vercel-build` script):
  - `prisma generate` ✅ **NEW**
  - `prisma migrate deploy` ✅ **NEW** (creates database tables)
  - `next build` ✅
- [ ] Build completes without errors
- [ ] **Note**: First build will be slower due to Prisma setup and migrations

### 6.3 Verify Deployment

- [ ] Site loads at production URL (`watercoolerdev.com`)
- [ ] Landing page still works (existing functionality preserved)
- [ ] New routes are accessible:
  - `/login` - Login page
  - `/signup` - Sign-up page
  - `/dashboard` - Dashboard (protected, requires auth)
  - `/onboarding` - Onboarding flow
- [ ] No console errors in browser
- [ ] Health check endpoint works: `https://watercoolerdev.com/api/health`
- [ ] Existing features (demo, quickstart, etc.) still function

## Phase 7: Testing Authentication Flow

### 7.1 Test Login Flow

- [ ] Visit `/login` page
- [ ] Click "Sign in with GitHub"
- [ ] Redirected to GitHub authorization
- [ ] Authorize the application
- [ ] Redirected back to site
- [ ] User is logged in (header shows user menu)

### 7.2 Test Onboarding

- [ ] After first login, should redirect to `/onboarding`
- [ ] Complete Step 1 (Welcome)
- [ ] Complete Step 2 (GitHub connection - should already be connected)
- [ ] Complete Step 3 (Dashboard intro)
- [ ] Redirected to `/dashboard`

### 7.3 Test Dashboard

- [ ] Dashboard loads without errors
- [ ] User menu in header works
- [ ] Can navigate to Settings
- [ ] Settings page shows GitHub connection status

### 7.4 Test Protected Routes

- [ ] Log out
- [ ] Try to access `/dashboard` directly
- [ ] Should redirect to `/login`
- [ ] After login, can access dashboard

## Phase 8: Production Hardening

### 8.1 Domain Configuration

**Note**: Domain `watercoolerdev.com` is already configured. Verify it's still active:

- [ ] Go to **Settings** → **Domains**
- [ ] Verify `watercoolerdev.com` is listed and active
- [ ] Check SSL certificate status (should be active)
- [ ] Update `NEXTAUTH_URL` environment variable to `https://watercoolerdev.com` (if not already set)
- [ ] Update GitHub OAuth callback URL to `https://watercoolerdev.com/api/auth/callback/github`
- [ ] Test domain resolves correctly: `curl -I https://watercoolerdev.com`

### 8.2 Security Checklist

- [ ] All environment variables are set (no missing values)
- [ ] `NEXTAUTH_SECRET` is strong (32+ characters, random)
- [ ] `ENCRYPTION_KEY` is strong (32+ characters, random)
- [ ] GitHub OAuth secret is stored securely
- [ ] Database connection uses SSL (marketplace providers default to SSL)
- [ ] HTTPS is enforced (Vercel default)
- [ ] Session cookies are HttpOnly and Secure (NextAuth default)

### 8.3 Performance Optimization

- [ ] Enable Vercel Analytics (optional)
- [ ] Configure caching headers if needed
- [ ] Monitor build times (should be < 5 minutes)
- [ ] Check Lighthouse scores (target: ≥95)

## Phase 9: Post-Launch Verification

### 9.1 Functional Testing

- [ ] User can sign up with GitHub
- [ ] User can sign in
- [ ] User can sign out
- [ ] Dashboard displays threads (if user has threads)
- [ ] Settings page saves preferences
- [ ] MCP credential API returns tokens (test with authenticated request)

### 9.2 Error Handling

- [ ] Test with invalid GitHub OAuth credentials (should show error)
- [ ] Test with expired session (should redirect to login)
- [ ] Test with missing environment variables (should fail gracefully)

### 9.3 Monitoring Setup

- [ ] Set up Vercel monitoring/alerts
- [ ] Check error logs in Vercel dashboard
- [ ] Monitor database connection pool usage
- [ ] Set up uptime monitoring (optional)

## Troubleshooting

### Build Fails

**Issue**: Prisma migration fails
- **Solution**: Check `DATABASE_URL` is correct and database is accessible
- **Solution**: Verify database has been created and is running

**Issue**: Environment variables missing
- **Solution**: Check all required variables are set in Vercel
- **Solution**: Verify variable names match exactly (case-sensitive)

### Authentication Fails

**Issue**: "Invalid callback URL"
- **Solution**: Verify GitHub OAuth callback URL matches `NEXTAUTH_URL/api/auth/callback/github`
- **Solution**: Check for trailing slashes or protocol mismatches

**Issue**: "OAuth error"
- **Solution**: Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- **Solution**: Check GitHub OAuth app is not suspended

### Database Issues

**Issue**: "Connection refused"
- **Solution**: Verify `DATABASE_URL` is correct
- **Solution**: Check database is running in provider dashboard (Neon/Supabase/etc.)
- **Solution**: Verify database region matches deployment region
- **Solution**: Check if database requires IP allowlisting (some providers do)

**Issue**: "Table does not exist"
- **Solution**: Run migrations manually: `pnpm prisma migrate deploy`
- **Solution**: Check migration logs in Vercel build output

## Quick Reference Commands

```bash
# Generate secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For ENCRYPTION_KEY

# Test locally (with .env.local)
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev

# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls
```

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **NextAuth.js Docs**: https://next-auth.js.org
- **Prisma Docs**: https://www.prisma.io/docs
- **GitHub OAuth Docs**: https://docs.github.com/en/apps/oauth-apps

## Launch Checklist Summary

Before deploying the update, ensure:

- [x] Code is committed and pushed to GitHub
- [ ] Existing Vercel project is located and verified
- [ ] Build configuration updated (vercel.json or package.json scripts)
- [ ] Postgres database is created via marketplace provider (NEW)
- [ ] All NEW environment variables are set (6 required)
- [ ] GitHub OAuth App is created and configured (NEW)
- [ ] Preview deployment tested (recommended)
- [ ] Production deployment succeeds
- [ ] Existing landing page functionality still works
- [ ] NEW authentication flow works end-to-end
- [ ] NEW dashboard loads and functions correctly
- [ ] Domain `watercoolerdev.com` still resolves correctly
- [ ] SSL certificate is active
- [ ] Monitoring is set up

**Status**: Ready to update existing deployment! 🚀

## What's New vs. What Stays the Same

### ✅ Preserved (Existing Features)
- Landing page design and content
- Demo section with thread playback
- Quickstart section
- All existing routes and pages
- SEO and metadata
- Domain configuration

### 🆕 Added (New Features)
- Authentication system (GitHub OAuth)
- User dashboard
- Database (Postgres via marketplace provider - Neon/Supabase/etc.)
- User settings and preferences
- Onboarding flow
- MCP credential API
- Protected routes (`/dashboard`, `/settings`)

### ⚠️ Changed (Build Process)
- Build now includes Prisma migrations
- New dependencies (Prisma, NextAuth, crypto-js)
- Environment variables required
- Build time will increase (first build ~2-3 minutes longer)

