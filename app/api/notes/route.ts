import { prisma } from "@/lib/db";
import { jsonError, serializeInboxNote } from "@/lib/serialize";
import { inboxNoteCreateSchema } from "@/lib/validations/client";

export async function GET() {
	const records = await prisma.inboxNote.findMany({
		orderBy: [{ done: "asc" }, { createdAt: "desc" }],
	});
	return Response.json(records.map(serializeInboxNote));
}

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const parsed = inboxNoteCreateSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const record = await prisma.inboxNote.create({
		data: { title: parsed.data.title },
	});
	return Response.json(serializeInboxNote(record), { status: 201 });
}
