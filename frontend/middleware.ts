import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Define Public Paths (Routes that don't need a token)
  // We use .some to keep it clean as the list grows
  const isPublicPath =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api") || // Local Next.js APIs
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico";
  if (isPublicPath) {
    return NextResponse.next();
  }

  // await new Promise((res, rej) => {
  //   setTimeout(() => {
  //     res(4);
  //   }, 2000);
  // });

  // 2. Extract token
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return redirectToLogin(req);
  }

  // 3. Server-side Validation
  try {
    // Note: Use an environment variable for the backend URL in production
    const verifyRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-token`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!verifyRes.ok) {
      return redirectToLogin(req);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth verification failed:", error);
    // On network error, we usually redirect to login to be safe
    return redirectToLogin(req);
  }
}

function redirectToLogin(req: NextRequest) {
  // Always use req.nextUrl to clone the base configuration
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  // Add current path as a redirect param so user returns here after login
  loginUrl.searchParams.set("from", req.nextUrl.pathname);

  const response = NextResponse.redirect(loginUrl);
  // Remove the invalid cookie
  response.cookies.delete("token");
  return response;
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (Next.js internal API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
