import { prisma } from "@/lib/db";
import { jsonError, serializeProposal } from "@/lib/serialize";
import { proposalUpdateSchema } from "@/lib/validations/client";
import { removeUpload, saveUpload } from "@/lib/files";
import { readFile } from "node:fs/promises";
import { resolveUpload } from "@/lib/files";

interface RouteContext {
	params: Promise<{ id: string; proposalId: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
	const { id, proposalId } = await params;
	const existing = await prisma.proposal.findFirst({
		where: { id: proposalId, clientId: id },
	});
	if (!existing) return jsonError("Propuesta no encontrada", 404);

	const contentType = request.headers.get("content-type") ?? "";
	let payload: Record<string, unknown> = {};
	let file: File | null = null;

	if (contentType.includes("multipart/form-data")) {
		const form = await request.formData();
		payload = {
			title: form.get("title") || undefined,
			amount: form.get("amount") || undefined,
			status: form.get("status") || undefined,
			sentAt: form.get("sentAt") || undefined,
			notes: form.get("notes") || undefined,
		};
		const uploaded = form.get("file");
		file = uploaded instanceof File && uploaded.size > 0 ? uploaded : null;
	} else {
		payload = await request.json().catch(() => ({}));
	}

	const parsed = proposalUpdateSchema.safeParse(payload);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const stored = file ? await saveUpload(id, file) : null;
	if (stored && existing.path) {
		await removeUpload(existing.path);
	}

	const record = await prisma.proposal.update({
		where: { id: proposalId },
		data: {
			title: parsed.data.title,
			amount: parsed.data.amount,
			status: parsed.data.status,
			sentAt:
				parsed.data.sentAt === undefined
					? undefined
					: parsed.data.sentAt
						? new Date(parsed.data.sentAt)
						: null,
			notes: parsed.data.notes,
			fileName: stored?.fileName,
			mimeType: stored?.mimeType,
			path: stored?.relativePath,
		},
	});

	return Response.json(serializeProposal(record));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const { id, proposalId } = await params;
	const existing = await prisma.proposal.findFirst({
		where: { id: proposalId, clientId: id },
	});
	if (!existing) return jsonError("Propuesta no encontrada", 404);
	if (existing.path) await removeUpload(existing.path);
	await prisma.proposal.delete({ where: { id: proposalId } });
	return new Response(null, { status: 204 });
}

export async function GET(_request: Request, { params }: RouteContext) {
	const { id, proposalId } = await params;
	const existing = await prisma.proposal.findFirst({
		where: { id: proposalId, clientId: id },
	});
	if (!existing?.path) return jsonError("Archivo no encontrado", 404);
	const bytes = await readFile(resolveUpload(existing.path));
	return new Response(bytes, {
		headers: {
			"Content-Type": existing.mimeType ?? "application/octet-stream",
			"Content-Disposition": `attachment; filename="${existing.fileName ?? "propuesta"}"`,
		},
	});
}
