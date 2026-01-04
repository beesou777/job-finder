import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Get the origin from the request
    const origin = request.headers.get('origin');
    
    // Create CORS headers - allow all origins
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    };
    
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
      response.headers.set(key, value);
    });
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

