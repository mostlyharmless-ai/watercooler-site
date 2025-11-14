import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { encryptToken } from '@/lib/encryption';

/**
 * Sync GitHub token from Account to GitHubToken table
 * This is called after sign-in to store encrypted tokens
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's GitHub account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
    });

    if (!account || !account.access_token) {
      return NextResponse.json({ error: 'GitHub account not found' }, { status: 404 });
    }

    // Encrypt and store the token
    const encryptedAccessToken = encryptToken(account.access_token);
    const encryptedRefreshToken = account.refresh_token
      ? encryptToken(account.refresh_token)
      : null;

    const expiresAt = account.expires_at
      ? new Date(account.expires_at * 1000)
      : new Date(Date.now() + 8 * 60 * 60 * 1000); // Default to 8 hours

    // Update or create GitHub token record
    await prisma.gitHubToken.upsert({
      where: { userId: session.user.id },
      update: {
        accessTokenEncrypted: encryptedAccessToken,
        refreshTokenEncrypted: encryptedRefreshToken,
        expiresAt: expiresAt,
        scopes: account.scope?.split(',') || [],
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        accessTokenEncrypted: encryptedAccessToken,
        refreshTokenEncrypted: encryptedRefreshToken,
        expiresAt: expiresAt,
        scopes: account.scope?.split(',') || [],
      },
    });

    // Also update user with GitHub info if available
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    if (user) {
      const githubAccount = user.accounts.find((acc) => acc.provider === 'github');
      if (githubAccount) {
        // Try to get GitHub profile info from the account
        // Note: We'd need to fetch this from GitHub API if not stored
        // For now, we'll just ensure the token is synced
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing GitHub token:', error);
    return NextResponse.json(
      { error: 'Failed to sync token' },
      { status: 500 }
    );
  }
}

