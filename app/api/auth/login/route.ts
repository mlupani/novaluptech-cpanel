import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { credentialsMatch } from "@/lib/auth-credentials";
import {
	safeNextPath,
	SESSION_COOKIE,
	SESSION_MAX_AGE,
	signSession,
} from "@/lib/auth";
import { jsonError } from "@/lib/serialize";

const loginSchema = z.object({
	username: z.string().trim().min(1, "El usuario es obligatorio"),
	password: z.string().min(1, "La contraseña es obligatoria"),
	next: z.string().optional().nullable(),
});

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	if (!credentialsMatch(parsed.data.username, parsed.data.password)) {
		return jsonError("Usuario o contraseña incorrectos", 401);
	}

	const token = await signSession(parsed.data.username);
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: SESSION_MAX_AGE,
	});

	return NextResponse.json({ ok: true, next: safeNextPath(parsed.data.next ?? null) });
}
