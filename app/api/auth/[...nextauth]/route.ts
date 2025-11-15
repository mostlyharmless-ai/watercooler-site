import { handlers } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Wrap handlers with error logging to capture callback failures
async function handleRequest(
  handler: (req: NextRequest) => Promise<Response>,
  req: NextRequest
): Promise<Response> {
  try {
    const url = new URL(req.url);
    console.error('[AUTH ROUTE] Handling request:', req.method, url.pathname);
    console.error('[AUTH ROUTE] Full URL:', req.url);
    console.error('[AUTH ROUTE] Query params:', url.search);
    
    const response = await handler(req);
    console.error('[AUTH ROUTE] Response status:', response.status);
    
    // Log redirect location if it's a redirect - this shows where NextAuth is sending the user
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      console.error('[AUTH ROUTE] Redirect location:', location);
      
      // If redirecting to GitHub, parse and log the redirect_uri parameter
      if (location && location.includes('github.com/login/oauth/authorize')) {
        try {
          const githubUrl = new URL(location);
          const redirectUri = githubUrl.searchParams.get('redirect_uri');
          console.error('[AUTH ROUTE] GitHub OAuth redirect_uri:', redirectUri);
          console.error('[AUTH ROUTE] This MUST match GitHub OAuth App callback URL exactly!');
        } catch (error) {
          console.error('[AUTH ROUTE] Error parsing GitHub OAuth URL:', error);
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error('[AUTH ROUTE] ERROR:', error);
    console.error('[AUTH ROUTE] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Authentication error', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(handlers.GET, req);
}

export async function POST(req: NextRequest) {
  return handleRequest(handlers.POST, req);
}

