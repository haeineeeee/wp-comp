import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Auth check will be done in the dashboard layout (server component)
  // Proxy only handles public redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sites/:path*",
    "/revenue/:path*",
    "/seo/:path*",
    "/settings/:path*",
  ],
};
