import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import { prisma } from './db';
import { encryptToken, decryptToken } from './encryption';

// SIMPLIFIED: Production-first approach
// Only override NEXTAUTH_URL if we're actually on a preview deployment
// Check if VERCEL_URL exists AND is different from NEXTAUTH_URL
const vercelUrl = process.env.VERCEL_URL;
const vercelEnv = process.env.VERCEL_ENV;
const originalNextAuthUrl = process.env.NEXTAUTH_URL || 'https://watercoolerdev.com';

// Log configuration immediately - use console.error to ensure visibility in Vercel logs
console.error('=== AUTH CONFIGURATION ===');
console.error('[AUTH] NEXTAUTH_URL (original):', originalNextAuthUrl);
console.error('[AUTH] VERCEL_URL:', vercelUrl || 'NOT SET');
console.error('[AUTH] VERCEL_ENV:', vercelEnv || 'NOT SET');
console.error('[AUTH] NODE_ENV:', process.env.NODE_ENV);
console.error('[AUTH] GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? `${process.env.GITHUB_CLIENT_ID.substring(0, 8)}...` : 'NOT SET');

// Only override for preview deployments
let finalNextAuthUrl = originalNextAuthUrl;
if (vercelEnv === 'preview' && vercelUrl && originalNextAuthUrl) {
  try {
    const vercelOrigin = new URL(`https://${vercelUrl}`).origin;
    const nextAuthOrigin = new URL(originalNextAuthUrl).origin;
    if (vercelOrigin !== nextAuthOrigin) {
      // Preview deployment - use preview URL
      finalNextAuthUrl = `https://${vercelUrl}`;
      console.error('PREVIEW DEPLOYMENT DETECTED');
      console.error('Overriding NEXTAUTH_URL to:', finalNextAuthUrl);
    } else {
      console.error('PRODUCTION DEPLOYMENT (VERCEL_URL matches NEXTAUTH_URL)');
    }
  } catch (error) {
    console.error('Error checking deployment type:', error);
  }
} else if (vercelEnv === 'production') {
  console.error('PRODUCTION DEPLOYMENT (VERCEL_ENV=production)');
} else if (!vercelEnv) {
  console.error('PRODUCTION DEPLOYMENT (no VERCEL_ENV set)');
} else {
  console.error(`NON-PRODUCTION DEPLOYMENT (${vercelEnv}) - not overriding NEXTAUTH_URL`);
}

// Set the final URL
process.env.NEXTAUTH_URL = finalNextAuthUrl;

const expectedCallbackUrl = `${finalNextAuthUrl}/api/auth/callback/github`;
console.error('[AUTH] Final NEXTAUTH_URL:', finalNextAuthUrl);
console.error('[AUTH] Expected callback URL:', expectedCallbackUrl);
console.error('[AUTH] GitHub OAuth App should have:', expectedCallbackUrl);
console.error('[AUTH] ===========================');

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
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
      console.error('[AUTH] signIn callback:', { 
        userId: user?.id, 
        email: user?.email,
        provider: account?.provider 
      });
      return true;
    },
    async session({ session, user }) {
      try {
        if (session?.user) {
          let userId: string | undefined;
          
          if (user?.id) {
            userId = user.id;
          } else if ((session.user as any)?.id) {
            userId = (session.user as any).id;
          } else if (session.user?.email) {
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
              console.error('[AUTH] Error fetching GitHub info:', dbError);
            }
          }
        }
      } catch (error) {
        console.error('[AUTH] Error in session callback:', error);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // SIMPLIFIED: Don't intercept API routes
      const urlString = String(url);
      if (urlString.includes('/api/')) {
        console.error('[AUTH] redirect: Allowing API route through:', urlString);
        return url;
      }
      
      // SIMPLIFIED: For production, just use the URL as-is if it's relative
      // Only override if we're on preview and URL is production
      const vercelUrl = process.env.VERCEL_URL;
      const nextAuthUrl = process.env.NEXTAUTH_URL;
      
      console.error('[AUTH] redirect callback:', {
        url: urlString,
        baseUrl,
        nextAuthUrl,
        vercelUrl,
      });
      
      // If URL is relative, make it absolute using baseUrl
      if (urlString.startsWith('/')) {
        const fullUrl = `${baseUrl}${urlString}`;
        console.error('[AUTH] redirect: Returning full URL:', fullUrl);
        return fullUrl;
      }
      
      // If URL is absolute and same origin, return as-is
      try {
        const urlObj = new URL(urlString);
        const baseObj = new URL(baseUrl);
        if (urlObj.origin === baseObj.origin) {
          console.error('[AUTH] redirect: Same origin, returning as-is:', urlString);
          return urlString;
        }
      } catch (error) {
        // URL parsing failed, return baseUrl as fallback
        console.error('[AUTH] redirect: URL parsing failed, using baseUrl:', baseUrl);
        return baseUrl;
      }
      
      // Fallback to baseUrl
      console.error('[AUTH] redirect: Fallback to baseUrl:', baseUrl);
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
});

// Helper function to get GitHub token (used by MCP credential API)
export async function getGitHubToken(userId: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const tokenRecord = await prisma.gitHubToken.findUnique({
      where: { userId },
    });

    if (!tokenRecord) {
      return null;
    }

    const accessToken = decryptToken(tokenRecord.accessTokenEncrypted);
    const refreshToken = tokenRecord.refreshTokenEncrypted ? decryptToken(tokenRecord.refreshTokenEncrypted) : '';

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error retrieving GitHub token:', error);
    return null;
  }
}
