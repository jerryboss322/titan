// middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

export default auth((req) => {
  const { nextUrl } = req;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (req as any).auth;
  const isLoggedIn = !!session?.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole: string | undefined = (session?.user as any)?.role;

  // Protect /admin — must be staff role
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/signin', nextUrl.origin));
    }
    if (!userRole || !ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL('/', nextUrl.origin));
    }
  }

  // Protect /orders and /account — must be signed in
  if (
    nextUrl.pathname.startsWith('/orders') ||
    nextUrl.pathname.startsWith('/account')
  ) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname);
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl.origin)
      );
    }
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/', nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/orders/:path*', '/account/:path*', '/auth/:path*'],
};
