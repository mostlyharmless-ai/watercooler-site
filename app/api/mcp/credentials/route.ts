import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGitHubToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get GitHub token for the user
    const token = await getGitHubToken(session.user.id);
    
    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token not found. Please reconnect your GitHub account.' },
        { status: 404 }
      );
    }

    // Get token expiration info
    const tokenRecord = await prisma.githubToken.findUnique({
      where: { userId: session.user.id },
      select: { expiresAt: true, scopes: true },
    });

    return NextResponse.json({
      github_token: token,
      expires_at: tokenRecord?.expiresAt?.toISOString() || null,
      scopes: tokenRecord?.scopes || [],
    });
  } catch (error) {
    console.error('Error retrieving MCP credentials:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve credentials' },
      { status: 500 }
    );
  }
}

