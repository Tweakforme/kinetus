import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

/**
 * Admin gate (Next 16 renamed middleware to proxy). Every /admin request except the
 * sign-in page must carry a session cookie with a valid signature that has not expired;
 * anything else is sent to sign in. This is a cookie check only: each admin page and
 * server action also checks the session row in the database (lib/admin/auth.ts), which is
 * what makes a logout or password reset take effect at once.
 *
 * Every /admin response also carries X-Robots-Tag: noindex, nofollow.
 */

const LOGIN_PATH = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  let response: NextResponse;
  if (pathname === LOGIN_PATH) {
    response = NextResponse.next();
  } else {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    response = session ? NextResponse.next() : signInResponse(request, `${pathname}${search}`);
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function signInResponse(request: NextRequest, returnTo: string): NextResponse {
  const login = new URL(LOGIN_PATH, request.url);
  if (returnTo !== "/admin" && request.method === "GET") {
    login.searchParams.set("next", returnTo);
  }

  // A server action is a fetch that expects a React response, not an HTML redirect. Next's
  // client reads x-action-redirect and navigates to the sign-in page instead.
  if (request.headers.has("next-action")) {
    return new NextResponse(null, {
      status: 401,
      headers: { "x-action-redirect": `${login.pathname}${login.search};replace` },
    });
  }

  // 303 turns a form POST into a GET of the sign-in page; page loads keep 307.
  const status = request.method === "GET" || request.method === "HEAD" ? 307 : 303;
  return NextResponse.redirect(login, status);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
