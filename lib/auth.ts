import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import { prisma } from './db';
import { encryptToken, decryptToken } from './encryption';

// CRITICAL FIX: Handle preview deployments for cookies while keeping production callback URL
// Save the original NEXTAUTH_URL (production) for OAuth callbacks
// Override NEXTAUTH_URL to preview domain for cookies and session management
const vercelUrl = process.env.VERCEL_URL;
const originalNextAuthUrl = process.env.NEXTAUTH_URL; // Save original (production) URL
let productionCallbackUrl = originalNextAuthUrl; // Default to production

if (vercelUrl && originalNextAuthUrl) {
  try {
    const vercelOrigin = new URL(`https://${vercelUrl}`).origin;
    const nextAuthOrigin = new URL(originalNextAuthUrl).origin;
    if (vercelOrigin !== nextAuthOrigin) {
      // We're on a preview deployment
      // Keep production URL for OAuth callback (must match GitHub OAuth App)
      productionCallbackUrl = originalNextAuthUrl;
      // Override NEXTAUTH_URL for cookies/session (must match preview domain)
      process.env.NEXTAUTH_URL = `https://${vercelUrl}`;
      console.error('[AUTH] Preview deployment detected:');
      console.error('[AUTH] - Using production callback URL:', `${productionCallbackUrl}/api/auth/callback/github`);
      console.error('[AUTH] - Using preview domain for cookies:', process.env.NEXTAUTH_URL);
    }
  } catch (error) {
    console.error('[AUTH] Error normalizing URLs for preview deployment:', error);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  trustHost: true, // Trust the host header (important for Vercel)
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'read:user user:email repo',
          // CRITICAL: Force redirect_uri to always use production callback URL
          // This allows preview deployments to work with a single GitHub OAuth App callback URL
          // GitHub OAuth App only needs: https://watercoolerdev.com/api/auth/callback/github
          redirect_uri: productionCallbackUrl 
            ? `${productionCallbackUrl}/api/auth/callback/github`
            : undefined,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Return true to allow sign-in - we'll handle token storage in a separate callback
      // This prevents foreign key constraint issues
      console.log('[AUTH] signIn callback:', { 
        userId: user?.id, 
        email: user?.email,
        provider: account?.provider 
      });
      return true;
    },
    async jwt({ token, account, profile, user }) {
      // This callback is called for JWT sessions, but we're using database sessions
      // So this won't be called, but we include it for completeness
      return token;
    },
    async session({ session, user }) {
      try {
        console.log('[AUTH] session callback:', { 
          hasSession: !!session, 
          hasUser: !!user,
          userId: user?.id,
          email: session?.user?.email 
        });
        
        if (session?.user) {
          // In NextAuth v5 with database sessions, user.id should be available
          // But we need to handle cases where user might be undefined
          let userId: string | undefined;
          
          if (user?.id) {
            userId = user.id;
          } else if ((session.user as any)?.id) {
            userId = (session.user as any).id;
          } else if (session.user?.email) {
            // Fallback: try to find user by email
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email },
              select: { id: true },
            });
            if (dbUser) {
              userId = dbUser.id;
            }
          }
          
          if (userId) {
            (session.user as any).id = userId;
            // Fetch GitHub username from user record
            try {
              const dbUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { githubUsername: true, githubId: true },
              });
              if (dbUser) {
                (session.user as any).githubUsername = dbUser.githubUsername;
                (session.user as any).githubId = dbUser.githubId;
              }
            } catch (dbError) {
              // Non-critical: if we can't fetch GitHub info, continue without it
              console.error('[AUTH] Error fetching GitHub info in session callback:', dbError);
            }
          }
          
          console.log('[AUTH] session callback result:', { 
            userId: (session.user as any)?.id,
            email: session.user?.email 
          });
        }
      } catch (error) {
        console.error('[AUTH] Error in session callback:', error);
        // Return session even if there's an error - don't break authentication
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // CRITICAL FIX #1: Don't intercept API routes - they should never go through redirect callback
      // This is the root cause of the loop - API routes were being redirected
      try {
        const urlObj = new URL(url, baseUrl || 'http://localhost');
        if (urlObj.pathname.startsWith('/api/')) {
          console.error('[AUTH] redirect callback - Allowing API route through:', urlObj.pathname);
          return url; // Let API routes through unchanged
        }
      } catch (error) {
        // If URL parsing fails, check if it starts with /api/ as a string
        if (typeof url === 'string' && url.startsWith('/api/')) {
          console.error('[AUTH] redirect callback - Allowing API route through (string check):', url);
          return url;
        }
      }
      
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      const vercelUrl = process.env.VERCEL_URL;
      
      // Log the raw parameters first - use console.error to ensure visibility
      console.error('[AUTH] redirect callback - RAW URL:', url);
      console.error('[AUTH] redirect callback - RAW baseUrl:', baseUrl);
      console.error('[AUTH] redirect callback - NEXTAUTH_URL:', nextAuthUrl);
      console.error('[AUTH] redirect callback - VERCEL_URL:', vercelUrl);
      console.error('[AUTH] redirect callback - URL includes query params:', url.includes('?'));
      console.error('[AUTH] redirect callback - Full URL string:', JSON.stringify(url));
      
      // CRITICAL FIX #2: Normalize baseUrl comparison using origins (as Codex suggested)
      // This ensures preview deployments always get the correct domain, even if URLs have
      // different formats (trailing slashes, protocols, etc.)
      let validBaseUrl = baseUrl;
      
      try {
        const baseOrigin = new URL(baseUrl).origin;
        const nextAuthOrigin = nextAuthUrl ? new URL(nextAuthUrl).origin : null;
        const vercelOrigin = vercelUrl ? new URL(`https://${vercelUrl}`).origin : null;
        
        // If we're on a preview deployment (VERCEL_URL exists) and baseUrl matches production,
        // override to use preview domain. Use origin comparison to handle format differences.
        if (vercelOrigin && nextAuthOrigin && baseOrigin === nextAuthOrigin) {
          validBaseUrl = `https://${vercelUrl}`;
          console.error('[AUTH] Overriding production baseUrl with preview URL (origin match):', validBaseUrl);
        } else if (vercelOrigin && baseOrigin !== vercelOrigin) {
          // If baseUrl doesn't match preview origin, use preview URL
          validBaseUrl = `https://${vercelUrl}`;
          console.error('[AUTH] Overriding baseUrl to preview URL (origin mismatch):', validBaseUrl);
        }
      } catch (error) {
        // Fallback to string-based comparison if URL parsing fails
        console.error('[AUTH] Error parsing URLs, using fallback comparison:', error);
        if (vercelUrl && baseUrl === nextAuthUrl) {
          validBaseUrl = `https://${vercelUrl}`;
          console.error('[AUTH] Overriding production baseUrl with preview URL (fallback):', validBaseUrl);
        } else if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
          // If baseUrl doesn't have protocol, try to construct it
          if (vercelUrl) {
            validBaseUrl = `https://${vercelUrl}`;
          } else {
            // Fallback: use NEXTAUTH_URL only if baseUrl is completely invalid
            validBaseUrl = nextAuthUrl || `https://${baseUrl}`;
          }
        }
      }
      
      console.log('[AUTH] Using baseUrl:', validBaseUrl);
      
      // Safety net: If we still get /dashboard (shouldn't happen with redirectTo fix),
      // redirect to /onboarding first. The onboarding page will check completion status
      // and redirect to dashboard if needed. This ensures new users always go through onboarding.
      // NOTE: With redirectTo parameter, we should now receive the correct URLs from NextAuth v5
      if (url === '/dashboard') {
        console.log('[AUTH] WARNING: Received /dashboard despite redirectTo fix - intercepting to /onboarding');
        console.log('[AUTH] This suggests redirectTo may not be working as expected. Check NextAuth v5 behavior.');
        const onboardingUrl = `${validBaseUrl}/onboarding`;
        console.log('[AUTH] Redirecting to:', onboardingUrl);
        return onboardingUrl;
      }
      
      // Also handle case where URL might be root - redirect to onboarding
      if (url === '/' || url === '') {
        console.log('[AUTH] Intercepting root redirect - redirecting to /onboarding');
        const onboardingUrl = `${validBaseUrl}/onboarding`;
        console.log('[AUTH] Redirecting to:', onboardingUrl);
        return onboardingUrl;
      }
      
      console.log('[AUTH] redirect callback - DETAILED:', { 
        url, 
        baseUrl, 
        validBaseUrl,
        nextAuthUrl,
        vercelUrl,
        isProduction: baseUrl === nextAuthUrl,
        urlType: typeof url,
        urlLength: url?.length,
        urlStartsWithSlash: url?.startsWith('/'),
        urlIncludesOnboarding: url?.includes('onboarding'),
        urlIncludesDashboard: url?.includes('dashboard'),
        fullUrl: typeof url === 'string' && url.startsWith('/') ? `${validBaseUrl}${url}` : url
      });
      
      // Allow relative callback URLs (most common case)
      if (url.startsWith('/')) {
        // CRITICAL FIX: Only intercept /dashboard redirects if they're coming from OAuth callback
        // We can detect this by checking if the URL is exactly /dashboard (no query params)
        // and it's not already /onboarding. The onboarding page will handle redirecting to
        // dashboard if onboarding is complete, so we only intercept OAuth-initiated redirects.
        // However, we can't easily distinguish OAuth redirects from other redirects.
        // So we'll let /dashboard through, but ensure onboarding page handles it properly.
        // Actually, let's NOT intercept - let the onboarding page handle the logic.
        // If user goes to /dashboard directly and hasn't completed onboarding, middleware/dashboard will handle it.
        
        // Preserve the exact callback URL - don't override it
        // NOTE: url should already include query parameters if they were in redirectTo
        const fullUrl = `${validBaseUrl}${url}`;
        console.error('[AUTH] redirect callback - Returning full URL:', fullUrl);
        console.error('[AUTH] redirect callback - URL has query params:', url.includes('?'));
        return fullUrl;
      }
      
      // Allow callback URLs on the same origin
      try {
        const urlOrigin = new URL(url).origin;
        const baseOrigin = new URL(validBaseUrl).origin;
        if (urlOrigin === baseOrigin) {
          console.log('[AUTH] redirecting to same origin:', url);
          return url;
        } else {
          // If different origin, convert to relative path if possible
          const urlPath = new URL(url).pathname;
          if (urlPath) {
            const relativeUrl = `${validBaseUrl}${urlPath}`;
            console.log('[AUTH] converting cross-origin to relative:', relativeUrl);
            return relativeUrl;
          }
        }
      } catch (error) {
        // If URL parsing fails, default to onboarding instead of root
        console.error('[AUTH] Error parsing URL in redirect callback:', error);
        const onboardingUrl = `${validBaseUrl}/onboarding`;
        console.log('[AUTH] redirecting to onboarding (fallback):', onboardingUrl);
        return onboardingUrl;
      }
      
      // Default to onboarding instead of root
      const onboardingUrl = `${validBaseUrl}/onboarding`;
      console.log('[AUTH] redirecting to onboarding (default):', onboardingUrl);
      return onboardingUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

/**
 * Get decrypted GitHub token for a user
 */
export async function getGitHubToken(userId: string): Promise<string | null> {
  try {
    const tokenRecord = await prisma.gitHubToken.findUnique({
      where: { userId },
    });

    if (!tokenRecord) {
      return null;
    }

    // Check if token is expired
    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
      // Token expired - would need to refresh here
      // For now, return null
      return null;
    }

    return decryptToken(tokenRecord.accessTokenEncrypted);
  } catch (error) {
    console.error('Error retrieving GitHub token:', error);
    return null;
  }
}

/**
 * Refresh GitHub token (placeholder - would need OAuth refresh flow)
 */
export async function refreshGitHubToken(userId: string): Promise<string | null> {
  // TODO: Implement OAuth token refresh flow
  // This would require calling GitHub's token refresh endpoint
  return null;
}

