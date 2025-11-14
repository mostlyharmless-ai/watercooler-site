# Watercooler Site Setup Guide

This guide will help you set up the Watercooler site with authentication, dashboard, and MCP integration.

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (or use SQLite for development)
- GitHub OAuth App credentials

## Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_URL` - Your site URL (e.g., `http://localhost:5001`)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `GITHUB_CLIENT_ID` - From GitHub OAuth App
   - `GITHUB_CLIENT_SECRET` - From GitHub OAuth App
   - `ENCRYPTION_KEY` - Generate with: `openssl rand -base64 32`

3. **Set up database:**
   ```bash
   # Generate Prisma client
   pnpm prisma generate

   # Run migrations
   pnpm prisma migrate dev --name init
   ```

4. **Create GitHub OAuth App:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to: `{NEXTAUTH_URL}/api/auth/callback/github`
   - Copy Client ID and Client Secret to `.env.local`

## Development

```bash
# Start development server
pnpm dev

# The site will be available at http://localhost:5001
```

## Features Implemented

### Phase 1: Authentication Infrastructure ✅
- NextAuth.js with GitHub OAuth provider
- Database schema with Prisma
- Encrypted token storage
- Session management
- Protected routes middleware

### Phase 2: Landing Page Updates ✅
- Login/sign-up pages
- Auth button component
- Updated header with user menu
- Session provider wrapper

### Phase 3: Dashboard Migration ✅
- TypeScript ThreadParser (converted from Python)
- Dashboard page with thread list
- Thread cards and status filtering
- Real-time updates (polling)
- Thread detail modal

### Phase 4: MCP Credential API ✅
- Secure API endpoint for MCP servers
- Token encryption/decryption
- Credential validation utilities

### Phase 5: Identity Management ✅
- User settings page
- GitHub connection status
- User preferences management
- Profile information display

### Phase 6: Onboarding Flow ✅
- Multi-step onboarding wizard
- Welcome screen
- GitHub connection flow
- Dashboard introduction

## Database Schema

The database includes:
- `User` - User accounts
- `Account` - OAuth account connections
- `Session` - User sessions
- `GitHubToken` - Encrypted GitHub tokens
- `UserPreferences` - User settings and preferences

## API Endpoints

- `GET /api/auth/[...nextauth]` - NextAuth.js handler
- `GET /api/dashboard/threads` - Fetch user threads
- `GET /api/mcp/credentials` - Get GitHub token for MCP
- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update user preferences
- `GET /api/user/profile` - Get user profile

## Next Steps

### For Development
1. Set up your database and environment variables
2. Run migrations to create the schema
3. Start the development server
4. Test the authentication flow
5. Configure MCP servers to use the credential API

### For Production Deployment
**See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete step-by-step deployment guide.**

Quick summary:
1. Set up Vercel Postgres database
2. Configure environment variables in Vercel
3. Create GitHub OAuth App
4. Deploy to Vercel
5. Test authentication flow

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`

### GitHub OAuth Issues
- Verify callback URL matches your `NEXTAUTH_URL`
- Check that Client ID and Secret are correct
- Ensure OAuth app has required scopes: `read:user`, `user:email`, `repo`

### Token Encryption Issues
- Ensure `ENCRYPTION_KEY` is set and consistent
- Key should be at least 32 characters

## Security Notes

- All GitHub tokens are encrypted at rest using AES-256
- Tokens are transmitted securely over HTTPS
- Session cookies are HttpOnly and Secure
- API endpoints are protected with authentication middleware

