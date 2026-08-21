import { createHash, timingSafeEqual } from "node:crypto";

export function getAuthCredentials() {
	return {
		username: process.env.AUTH_USER ?? "",
		password: process.env.AUTH_PASSWORD ?? "",
	};
}

function digest(value: string) {
	return createHash("sha256").update(value).digest();
}

export function credentialsMatch(username: string, password: string) {
	const expected = getAuthCredentials();
	if (!expected.username || !expected.password) return false;
	const userOk = timingSafeEqual(digest(username), digest(expected.username));
	const passOk = timingSafeEqual(digest(password), digest(expected.password));
	return userOk && passOk;
}
