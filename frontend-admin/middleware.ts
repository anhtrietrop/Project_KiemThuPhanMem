import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simplified middleware that's compatible with Edge Runtime
// Note: Full authentication check is done in page components using getServerSession()
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";
  const isApiRoute = pathname.startsWith("/api");
  const isStaticFile = pathname.startsWith("/_next") || 
                       pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/);

  // Skip middleware for API routes and static files
  if (isApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  // For login page, allow access
  if (isLoginPage) {
    return NextResponse.next();
  }

  // For all other routes, let them through
  // Authentication will be checked in page components using requireAdmin() or getServerSession()
  // This approach is compatible with Edge Runtime and avoids the "Code generation from strings" error
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$|.*\\.webp$).*)",
  ],
};
