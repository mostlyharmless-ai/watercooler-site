import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import { prisma } from './db';
import { encryptToken, decryptToken } from './encryption';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
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
      if (account && account.provider === 'github') {
        try {
          // Store encrypted GitHub token
          const encryptedAccessToken = encryptToken(account.access_token || '');
          const encryptedRefreshToken = account.refresh_token
            ? encryptToken(account.refresh_token)
            : null;

          // Calculate expiration (GitHub tokens typically expire in 8 hours, but we'll use the provided expires_at)
          const expiresAt = account.expires_at
            ? new Date(account.expires_at * 1000)
            : new Date(Date.now() + 8 * 60 * 60 * 1000); // Default to 8 hours

          // Update or create GitHub token record
          await prisma.githubToken.upsert({
            where: { userId: user.id },
            update: {
              accessTokenEncrypted: encryptedAccessToken,
              refreshTokenEncrypted: encryptedRefreshToken,
              expiresAt: expiresAt,
              scopes: account.scope?.split(',') || [],
              updatedAt: new Date(),
            },
            create: {
              userId: user.id,
              accessTokenEncrypted: encryptedAccessToken,
              refreshTokenEncrypted: encryptedRefreshToken,
              expiresAt: expiresAt,
              scopes: account.scope?.split(',') || [],
            },
          });

          // Update user with GitHub info
          if (profile && 'id' in profile) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                githubId: typeof profile.id === 'number' ? profile.id : parseInt(String(profile.id)),
                githubUsername: profile.login as string,
              },
            });
          }
        } catch (error) {
          console.error('Error storing GitHub token:', error);
          // Don't block sign-in if token storage fails
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch GitHub username from user record
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { githubUsername: true, githubId: true },
        });
        if (dbUser) {
          (session.user as any).githubUsername = dbUser.githubUsername;
          (session.user as any).githubId = dbUser.githubId;
        }
      }
      return session;
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
};

/**
 * Get decrypted GitHub token for a user
 */
export async function getGitHubToken(userId: string): Promise<string | null> {
  try {
    const tokenRecord = await prisma.githubToken.findUnique({
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

