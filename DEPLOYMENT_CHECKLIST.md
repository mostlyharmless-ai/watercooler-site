# Watercooler Site Deployment Checklist

**⚠️ IMPORTANT: This is an UPDATE to an existing Vercel deployment**

The watercooler-site is already deployed at `watercooler-dev.com`. This checklist covers updating the existing deployment to add authentication, database, and dashboard features.

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
- [ ] Note the current deployment URL (likely `watercooler-dev.com` or `watercooler-site.vercel.app`)

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

## Phase 2: Database Setup (Vercel Postgres)

### 2.1 Create Postgres Database

- [ ] In Vercel project dashboard, go to **Storage** tab
- [ ] Click **Create Database**
- [ ] Select **Postgres**
- [ ] Choose region (closest to your users)
- [ ] Select plan (Hobby plan is free for development)
- [ ] Click **Create**
- [ ] Wait for database provisioning (1-2 minutes)

### 2.2 Get Database Connection String

- [ ] After database is created, go to **Storage** → Your database
- [ ] Click on **.env.local** tab
- [ ] Copy the `POSTGRES_URL` value
- [ ] **Note**: Vercel automatically adds this as `DATABASE_URL` environment variable
- [ ] Verify `DATABASE_URL` appears in **Settings** → **Environment Variables**

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
  - Value: Automatically set by Vercel Postgres (verify it exists)
  - Environments: Production, Preview, Development

- [ ] **`NEXTAUTH_URL`**
  - Value: Your production URL (e.g., `https://watercooler-dev.com` or `https://watercooler-site.vercel.app`)
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
  - **Homepage URL**: Your production URL (e.g., `https://watercooler-dev.com`)
  - **Authorization callback URL**: `https://your-domain.com/api/auth/callback/github`
    - Replace `your-domain.com` with your actual domain
    - For Vercel preview: `https://watercooler-site.vercel.app/api/auth/callback/github`
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
  - Connect to Vercel Postgres and check for tables:
    - `User`
    - `Account`
    - `Session`
    - `VerificationToken`
    - `GitHubToken`
    - `UserPreferences`

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

- [ ] Site loads at production URL (`watercooler-dev.com`)
- [ ] Landing page still works (existing functionality preserved)
- [ ] New routes are accessible:
  - `/login` - Login page
  - `/signup` - Sign-up page
  - `/dashboard` - Dashboard (protected, requires auth)
  - `/onboarding` - Onboarding flow
- [ ] No console errors in browser
- [ ] Health check endpoint works: `https://watercooler-dev.com/api/health`
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

**Note**: Domain `watercooler-dev.com` is already configured. Verify it's still active:

- [ ] Go to **Settings** → **Domains**
- [ ] Verify `watercooler-dev.com` is listed and active
- [ ] Check SSL certificate status (should be active)
- [ ] Update `NEXTAUTH_URL` environment variable to `https://watercooler-dev.com` (if not already set)
- [ ] Update GitHub OAuth callback URL to `https://watercooler-dev.com/api/auth/callback/github`
- [ ] Test domain resolves correctly: `curl -I https://watercooler-dev.com`

### 8.2 Security Checklist

- [ ] All environment variables are set (no missing values)
- [ ] `NEXTAUTH_SECRET` is strong (32+ characters, random)
- [ ] `ENCRYPTION_KEY` is strong (32+ characters, random)
- [ ] GitHub OAuth secret is stored securely
- [ ] Database connection uses SSL (Vercel Postgres default)
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
- **Solution**: Check database is running in Vercel dashboard
- **Solution**: Verify database region matches deployment region

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
- [ ] Vercel Postgres database is created (NEW)
- [ ] All NEW environment variables are set (6 required)
- [ ] GitHub OAuth App is created and configured (NEW)
- [ ] Preview deployment tested (recommended)
- [ ] Production deployment succeeds
- [ ] Existing landing page functionality still works
- [ ] NEW authentication flow works end-to-end
- [ ] NEW dashboard loads and functions correctly
- [ ] Domain `watercooler-dev.com` still resolves correctly
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
- Database (Vercel Postgres)
- User settings and preferences
- Onboarding flow
- MCP credential API
- Protected routes (`/dashboard`, `/settings`)

### ⚠️ Changed (Build Process)
- Build now includes Prisma migrations
- New dependencies (Prisma, NextAuth, crypto-js)
- Environment variables required
- Build time will increase (first build ~2-3 minutes longer)

