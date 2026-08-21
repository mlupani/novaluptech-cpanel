import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const uploadRoot = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

export function getUploadRoot() {
	return uploadRoot;
}

export async function saveUpload(
	clientId: string,
	file: File,
): Promise<{ relativePath: string; fileName: string; mimeType: string; size: number }> {
	const buffer = Buffer.from(await file.arrayBuffer());
	const ext = path.extname(file.name);
	const storedName = `${randomUUID()}${ext}`;
	const dir = path.join(uploadRoot, clientId);
	await mkdir(dir, { recursive: true });
	const absolute = path.join(dir, storedName);
	await writeFile(absolute, buffer);

	return {
		relativePath: path.join(clientId, storedName),
		fileName: file.name,
		mimeType: file.type || "application/octet-stream",
		size: buffer.length,
	};
}

export async function removeUpload(relativePath: string) {
	const absolute = path.join(uploadRoot, relativePath);
	await unlink(absolute).catch(() => undefined);
}

export function resolveUpload(relativePath: string) {
	return path.join(uploadRoot, relativePath);
}
