import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/login"]);

function isSecureRequest(req: NextRequest) {
  return (
    req.nextUrl.protocol === "https:" ||
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production"
  );
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.has(path);
  const secureCookie = isSecureRequest(req);

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie,
    cookieName: secureCookie
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  });

  const signedIn = Boolean(token?.sub) && token?.error !== "AccessTokenExpired";

  if (token?.error === "AccessTokenExpired" && !isPublic) {
    const login = new URL("/login", req.url);
    login.searchParams.set("error", "SessionExpired");
    const response = NextResponse.redirect(login);
    response.cookies.set("next-auth.session-token", "", { maxAge: 0 });
    response.cookies.set("__Secure-next-auth.session-token", "", { maxAge: 0 });
    return response;
  }

  if (!isPublic && !signedIn) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }

  if (isPublic && signedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
