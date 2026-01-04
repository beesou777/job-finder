import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Add CORS headers to a NextResponse
 * Use this in API routes to ensure CORS is enabled
 */
export function addCorsHeaders(
  response: NextResponse,
  request?: NextRequest
): NextResponse {
  const origin = request?.headers.get('origin') || '*';
  
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return response;
}

/**
 * Create a CORS-enabled response for OPTIONS preflight requests
 */
export function createCorsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

