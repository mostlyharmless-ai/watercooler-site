import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ThreadParser } from '@/lib/threadParser';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences for threads base path
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    const threadsBase = preferences?.threadsBasePath || process.env.WATERCOOLER_THREADS_BASE;
    const parser = new ThreadParser(threadsBase || undefined);
    
    const threads = await parser.getAllThreads();
    
    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

