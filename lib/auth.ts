import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import { prisma } from './db';
import { encryptToken, decryptToken } from './encryption';

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
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      const vercelUrl = process.env.VERCEL_URL;
      
      console.log('[AUTH] redirect callback:', { 
        url, 
        baseUrl, 
        nextAuthUrl,
        vercelUrl,
        isProduction: baseUrl === nextAuthUrl,
        urlType: typeof url,
        urlLength: url?.length,
        urlStartsWithSlash: url?.startsWith('/'),
        urlIncludesOnboarding: url?.includes('onboarding'),
        urlIncludesDashboard: url?.includes('dashboard'),
        fullUrl: typeof url === 'string' && url.startsWith('/') ? `${baseUrl}${url}` : url
      });
      
      // CRITICAL FIX: If baseUrl is production (NEXTAUTH_URL) but we're on a preview deployment,
      // use VERCEL_URL instead. This prevents redirecting to production from preview deployments.
      let validBaseUrl = baseUrl;
      
      // Check if baseUrl is production but we're on a preview deployment
      if (vercelUrl && baseUrl === nextAuthUrl) {
        // We're on a preview deployment but baseUrl is production - use preview URL
        validBaseUrl = `https://${vercelUrl}`;
        console.log('[AUTH] Overriding production baseUrl with preview URL:', validBaseUrl);
      } else if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        // If baseUrl doesn't have protocol, try to construct it
        if (vercelUrl) {
          validBaseUrl = `https://${vercelUrl}`;
        } else {
          // Fallback: use NEXTAUTH_URL only if baseUrl is completely invalid
          validBaseUrl = nextAuthUrl || `https://${baseUrl}`;
        }
      }
      
      console.log('[AUTH] Using baseUrl:', validBaseUrl);
      
      // Allow relative callback URLs (most common case)
      if (url.startsWith('/')) {
        // CRITICAL: If URL is /dashboard but we should be in onboarding, check if this is a new user
        // This handles the case where NextAuth might be using a default redirect
        // We'll let the onboarding page handle the redirect to dashboard if onboarding is complete
        if (url === '/dashboard' && !url.includes('onboarding')) {
          // Check if we should redirect to onboarding instead
          // This is a heuristic - if the URL is just /dashboard without query params,
          // and we're coming from a sign-in, we might want to go to onboarding first
          // But we can't check user state here, so we'll preserve the URL
          // The onboarding page will check and redirect if needed
          console.log('[AUTH] WARNING: Redirecting to /dashboard - onboarding page should handle this');
        }
        
        // Preserve the exact callback URL - don't override it
        const fullUrl = `${validBaseUrl}${url}`;
        console.log('[AUTH] redirecting to callback URL:', fullUrl);
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

