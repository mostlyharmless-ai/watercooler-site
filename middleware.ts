import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Protect API routes
  if (request.nextUrl.pathname.startsWith('/api/mcp') || 
      request.nextUrl.pathname.startsWith('/api/user')) {
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/mcp/:path*',
    '/api/user/:path*',
  ],
};

