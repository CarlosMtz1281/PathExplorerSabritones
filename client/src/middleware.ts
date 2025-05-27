import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas protegidas 
const protectedRoutes: Record<string, number[]> = {
  "/dashboard/create-users": [5],
  "/dashboard/crea-projects": [4],
  "/dashboard/pl-dashboard": [2,3],
  "/dashboard/cl-dashboard": [3],
  "/dashboard/repo-empleados": [1,2,3,4,5],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Si no hay sesión, redirige al login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const roleId = Number(token.role_id || 0);

    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(roleId)) {
        return NextResponse.redirect(new URL("/403", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Ejecuta este middleware solo en rutas bajo /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};
