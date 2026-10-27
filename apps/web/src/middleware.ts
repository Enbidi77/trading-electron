import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('trd_pro_session')?.value;

  // Protected application routes
  const isProtectedRoute =
    pathname.startsWith('/terminal') ||
    pathname.startsWith('/watchlist') ||
    pathname.startsWith('/screener') ||
    pathname.startsWith('/portfolio') ||
    pathname.startsWith('/paper-trading') ||
    pathname.startsWith('/alerts') ||
    pathname.startsWith('/backtesting') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/news') ||
    pathname.startsWith('/heatmap') ||
    pathname.startsWith('/risk') ||
    pathname.startsWith('/settings');

  // If user visits protected route and has no session, redirect to /login with redirect return param
  // Note: For instant trial / demo preview ease, if no session, we can either redirect to /login
  // or allow demo access with a notification. Redirecting to /login is standard per Section 7 Auth requirements!
  // To allow graceful demo exploration, we redirect to login, where user can 1-click "Sign in with Demo Account".
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and visits /login or /register, redirect to /terminal
  if ((pathname === '/login' || pathname === '/register') && sessionCookie) {
    return NextResponse.redirect(new URL('/terminal', request.url));
  }

  // Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
};

