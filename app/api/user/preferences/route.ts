import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      threadsBasePath: preferences?.threadsBasePath || null,
      defaultProjectId: preferences?.defaultProjectId || null,
      onboardingCompleted: preferences?.onboardingCompleted || false,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { threadsBasePath, defaultProjectId, onboardingCompleted } = body;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        threadsBasePath: threadsBasePath !== undefined ? (threadsBasePath || null) : undefined,
        defaultProjectId: defaultProjectId !== undefined ? (defaultProjectId || null) : undefined,
        onboardingCompleted: onboardingCompleted !== undefined ? onboardingCompleted : undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        threadsBasePath: threadsBasePath || null,
        defaultProjectId: defaultProjectId || null,
        onboardingCompleted: onboardingCompleted || false,
      },
    });

    return NextResponse.json({
      threadsBasePath: preferences.threadsBasePath,
      defaultProjectId: preferences.defaultProjectId,
      onboardingCompleted: preferences.onboardingCompleted,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

