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
      return true;
    },
    async jwt({ token, account, profile, user }) {
      // This callback is called for JWT sessions, but we're using database sessions
      // So this won't be called, but we include it for completeness
      return token;
    },
    async session({ session, user }) {
      try {
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
              console.error('Error fetching GitHub info in session callback:', dbError);
            }
          }
        }
      } catch (error) {
        console.error('Error in session callback:', error);
        // Return session even if there's an error - don't break authentication
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Ensure baseUrl has protocol (fallback to NEXTAUTH_URL if baseUrl is invalid)
      const nextAuthUrl = process.env.NEXTAUTH_URL || baseUrl;
      let validBaseUrl = baseUrl;
      
      // If baseUrl doesn't have protocol, use NEXTAUTH_URL or add https://
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        validBaseUrl = nextAuthUrl || `https://${baseUrl}`;
      }
      
      // Allow relative callback URLs (most common case)
      if (url.startsWith('/')) {
        const fullUrl = `${validBaseUrl}${url}`;
        // Ensure we're not redirecting to root if we have a specific callback
        if (url !== '/' || url.includes('onboarding') || url.includes('dashboard') || url.includes('login')) {
          return fullUrl;
        }
        // Default to onboarding if redirecting to root
        return `${validBaseUrl}/onboarding`;
      }
      
      // Allow callback URLs on the same origin
      try {
        const urlOrigin = new URL(url).origin;
        const baseOrigin = new URL(validBaseUrl).origin;
        if (urlOrigin === baseOrigin) {
          return url;
        }
      } catch (error) {
        // If URL parsing fails, default to onboarding instead of root
        console.error('Error parsing URL in redirect callback:', error);
        return `${validBaseUrl}/onboarding`;
      }
      
      // Default to onboarding instead of root
      return `${validBaseUrl}/onboarding`;
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

