// Middleware for handling navigation and API requests
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Set CORS headers to allow cross-origin requests if needed
  const response = NextResponse.next();

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Prevent unwanted redirects for specific routes
  if (pathname === '/ai-studio' ||
      pathname === '/features' ||
      pathname === '/how-it-works' ||
      pathname === '/pricing' ||
      pathname === '/about' ||
      pathname === '/contact') {
    // Ensure we're not redirecting these routes
    return response;
  }

  return response;
}

// Run middleware on all routes
export const config = {
  matcher: [
    '/api/:path*',
    '/ai-studio',
    '/features',
    '/how-it-works',
    '/pricing',
    '/about',
    '/contact'
  ],
};