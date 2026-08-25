import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/serialize";
import { removeUpload, resolveUpload } from "@/lib/files";
import { readFile } from "node:fs/promises";

interface RouteContext {
	params: Promise<{ id: string; documentId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const { id, documentId } = await params;
	const existing = await prisma.document.findFirst({
		where: { id: documentId, clientId: id },
	});
	if (!existing) return jsonError("Documento no encontrado", 404);
	await removeUpload(existing.path);
	await prisma.document.delete({ where: { id: documentId } });
	return new Response(null, { status: 204 });
}

export async function GET(request: Request, { params }: RouteContext) {
	const { id, documentId } = await params;
	const existing = await prisma.document.findFirst({
		where: { id: documentId, clientId: id },
	});
	if (!existing) return jsonError("Documento no encontrado", 404);
	const bytes = await readFile(resolveUpload(existing.path));
	const { searchParams } = new URL(request.url);
	const forceDownload = searchParams.get("download") === "1";
	const disposition = forceDownload ? "attachment" : "inline";
	return new Response(bytes, {
		headers: {
			"Content-Type": existing.mimeType,
			"Content-Disposition": `${disposition}; filename="${existing.fileName}"`,
			"Cache-Control": "private, max-age=300",
		},
	});
}
