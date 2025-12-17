// Minimal middleware - compatible with Edge Runtime
// Authentication is handled in page components using getServerSession()
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // Pass through all requests - no processing needed
  // Authentication checks happen in page components
  return NextResponse.next();
}

// Empty matcher means middleware won't run
// This effectively disables middleware while keeping the file structure
export const config = {
  matcher: [],
};
