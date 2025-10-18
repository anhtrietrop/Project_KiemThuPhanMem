import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isLoginPage = req.nextUrl.pathname === "/login";
    
    // If user is logged in but not admin, redirect to login and clear session
    if (token && token.role !== "admin" && !isLoginPage) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(loginUrl);
    }
    
    // If not logged in and not on login page, redirect to login
    if (!token && !isLoginPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    
    // If admin is trying to access login page, redirect to dashboard
    if (token && token.role === "admin" && isLoginPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isLoginPage = req.nextUrl.pathname === "/login";
        
        // Allow access to login page without token
        if (isLoginPage) {
          return true;
        }
        
        // All other routes require admin token
        return !!token && token.role === "admin";
      },
    },
  }
);

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
