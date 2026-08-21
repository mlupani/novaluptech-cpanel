import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "novalup_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

interface SessionPayload {
	sub: string;
}

function getSecret() {
	const secret = process.env.AUTH_SECRET;
	if (!secret || secret.length < 16) {
		throw new Error("AUTH_SECRET debe tener al menos 16 caracteres");
	}
	return new TextEncoder().encode(secret);
}

export async function signSession(username: string) {
	return new SignJWT({ sub: username } satisfies SessionPayload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(`${SESSION_MAX_AGE}s`)
		.sign(getSecret());
}

export async function verifySession(
	token: string | undefined,
): Promise<SessionPayload | null> {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, getSecret());
		if (typeof payload.sub !== "string" || payload.sub.length === 0) {
			return null;
		}
		return { sub: payload.sub };
	} catch {
		return null;
	}
}

export function isPublicPath(pathname: string) {
	return pathname === "/login" || pathname === "/api/auth/login";
}

export function safeNextPath(value: string | null) {
	if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
	if (value.startsWith("/login")) return "/";
	return value;
}
