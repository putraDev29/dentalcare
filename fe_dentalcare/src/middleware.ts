import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Allow Next.js internals, static files, images, favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Normalize pathname: strip trailing slash for clean comparison (keep root as '/')
  const cleanPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  // 2. Auth public routes
  const isAuthRoute =
    cleanPath === '/login' ||
    cleanPath === '/forgot-password' ||
    cleanPath === '/reset-password';

  // 3. Check session/token cookie
  const token =
    request.cookies.get('dentalcare_token')?.value ||
    request.cookies.get('auth_token')?.value ||
    request.cookies.get('ehealth_auth_session')?.value;

  // 4. If root path '/', redirect to dashboard if authenticated, or login if not
  if (cleanPath === '/' || cleanPath === '') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard/', request.url));
    } else {
      return NextResponse.redirect(new URL('/login/', request.url));
    }
  }

  // 5. If trying to access protected dashboard route without token, redirect to /login/
  if (!token && !isAuthRoute) {
    const loginUrl = new URL('/login/', request.url);
    const redirectPath = pathname + search;
    // Don't set redirect parameter if it points to an auth route or root or contains login
    if (
      redirectPath &&
      redirectPath !== '/' &&
      redirectPath !== '/login/' &&
      !cleanPath.startsWith('/login') &&
      !cleanPath.startsWith('/forgot-password') &&
      !cleanPath.startsWith('/reset-password')
    ) {
      loginUrl.searchParams.set('redirect', redirectPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 6. If already logged in and visiting auth pages (e.g. /login/), redirect to /dashboard/
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
