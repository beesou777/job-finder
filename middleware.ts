import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = new Set([
  'https://www.kamkhoj.com',
  'https://kamkhoj.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3011',
  'http://localhost:3012',
]);

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Get the origin from the request
    const origin = request.headers.get('origin');
    
    // Create CORS headers - allow all origins
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    };
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }
    
    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
      });
    }
    
    // For other requests, add CORS headers to the response
    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) response.headers.set(key, value);
    });
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

