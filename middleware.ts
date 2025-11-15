import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Skip auth check for auth routes to avoid circular redirects
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }
    
    console.log('[MIDDLEWARE] Checking:', { path: request.nextUrl.pathname });
    const session = await auth();
    console.log('[MIDDLEWARE] Session:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      path: request.nextUrl.pathname 
    });
    
    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      // Allow access if session exists (even without user.id initially)
      // The dashboard layout will handle redirecting if needed
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    
    return NextResponse.next();
  } catch (error) {
    // Log error but don't block - let the route handle it
    console.error('Middleware error:', error);
    // For dashboard routes, redirect to login on error
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Otherwise, continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};

