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

// --- Lightweight anti-scrape guards (edge-safe, best-effort per instance) ---
const BOT_PATTERN =
  /(python-requests|scrapy|beautifulsoup|selenium|puppeteer|playwright|curl|wget|httpclient|okhttp|postman|insomnia|go-http-client|java\/|libwww|masscan|nmap|nikto|sqlmap|acunetix|semrush|ahrefs|mj12bot|dotbot|blexbot|dataforseo|bytespider|gptbot|ccbot|anthropic-ai|claudebot|cohere-ai|omgili|diffbot)/i;

// Bulk-dump caps: scrapers love ?limit=10000. Force small pages server-side.
const MAX_LIMIT = 50;
const MAX_OFFSET = 2000;

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

function noIndex(response: NextResponse): NextResponse {
  // Never let search engines index raw JSON — only the rendered pages.
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent') || '';

  // 1. Block obvious bots / headless scrapers on JSON endpoints only.
  //    (HTML pages are intentionally left crawlable for SEO.)
  if (!userAgent || BOT_PATTERN.test(userAgent)) {
    return noIndex(
      new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  // 2. Basic per-IP rate limiting to slow bulk crawls.
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  if (isRateLimited(ip)) {
    return noIndex(
      new NextResponse(JSON.stringify({ error: 'Too many requests. Slow down.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }),
    );
  }

  // 3. Clamp pagination so one call can't dump the whole corpus.
  //    Only applies to GET list endpoints that actually accept these params —
  //    never to auth/mutation routes. Missing params are valid (no clamping).
  const LIST_PATHS = [
    '/api/jobs',
    '/api/categories',
    '/api/linkedin-jobs',
    '/api/remote-jobs',
    '/api/companies',
    '/api/admin/opportunities',
    '/api/analytics',
  ];
  const isListRoute =
    request.method === 'GET' &&
    LIST_PATHS.some(
      (p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(`${p}/`),
    );
  if (isListRoute) {
    const limitRaw = request.nextUrl.searchParams.get('limit');
    const offsetRaw = request.nextUrl.searchParams.get('offset');
    const limit = limitRaw === null ? null : Number(limitRaw);
    const offset = offsetRaw === null ? null : Number(offsetRaw);
    const badLimit =
      limit !== null && (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT);
    const badOffset =
      offset !== null && (!Number.isInteger(offset) || offset < 0 || offset > MAX_OFFSET);
    if (badLimit || badOffset) {
      return noIndex(
        new NextResponse(JSON.stringify({ error: `Pagination limited: limit 1-${MAX_LIMIT}.` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
  }

  // Get the origin from the request
  // Create CORS headers - allow only known origins
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
    return noIndex(
      new NextResponse(null, {
        status: 200,
        headers: corsHeaders,
      }),
    );
  }

  // For other requests, add CORS headers to the response
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (value) response.headers.set(key, value);
  });

  return noIndex(response);
}

export const config = {
  matcher: '/api/:path*',
};
