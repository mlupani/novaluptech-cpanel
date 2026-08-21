import { prisma } from "@/lib/db";
import { jsonError, serializeInboxNote } from "@/lib/serialize";
import { inboxNoteUpdateSchema } from "@/lib/validations/client";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
	const { id } = await params;
	const existing = await prisma.inboxNote.findUnique({ where: { id } });
	if (!existing) return jsonError("Nota no encontrada", 404);

	const body = await request.json().catch(() => null);
	const parsed = inboxNoteUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const record = await prisma.inboxNote.update({
		where: { id },
		data: parsed.data,
	});
	return Response.json(serializeInboxNote(record));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const { id } = await params;
	const existing = await prisma.inboxNote.findUnique({ where: { id } });
	if (!existing) return jsonError("Nota no encontrada", 404);
	await prisma.inboxNote.delete({ where: { id } });
	return new Response(null, { status: 204 });
}
