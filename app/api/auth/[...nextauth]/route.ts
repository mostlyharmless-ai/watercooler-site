import { handlers } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Wrap handlers with error logging
async function handleRequest(
  handler: (req: NextRequest) => Promise<Response>,
  req: NextRequest
): Promise<Response> {
  try {
    console.error('[AUTH ROUTE] Handling request:', req.method, req.url);
    const response = await handler(req);
    console.error('[AUTH ROUTE] Response status:', response.status);
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

