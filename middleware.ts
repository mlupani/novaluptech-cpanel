import { NextRequest, NextResponse } from "next/server";
import { isPublicPath, SESSION_COOKIE, verifySession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const session = await verifySession(
		request.cookies.get(SESSION_COOKIE)?.value,
	);

	if (!session && !isPublicPath(pathname)) {
		if (pathname.startsWith("/api/")) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}
		const loginUrl = new URL("/login", request.url);
		if (pathname !== "/") {
			loginUrl.searchParams.set("next", pathname);
		}
		return NextResponse.redirect(loginUrl);
	}

	if (session && pathname === "/login") {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
