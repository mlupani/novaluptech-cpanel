import { prisma } from "@/lib/db";
import { jsonError, serializeDocument } from "@/lib/serialize";
import { documentCategorySchema } from "@/lib/validations/client";
import { saveUpload } from "@/lib/files";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
	const { id } = await params;
	const records = await prisma.document.findMany({
		where: { clientId: id },
		orderBy: { createdAt: "desc" },
	});
	return Response.json(records.map(serializeDocument));
}

export async function POST(request: Request, { params }: RouteContext) {
	const { id } = await params;
	const client = await prisma.client.findUnique({ where: { id } });
	if (!client) return jsonError("Cliente no encontrado", 404);

	const form = await request.formData();
	const title = String(form.get("title") ?? "").trim();
	const categoryParsed = documentCategorySchema.safeParse(
		form.get("category") ?? "documentation",
	);
	const notesRaw = String(form.get("notes") ?? "").trim();
	const file = form.get("file");

	if (!title) return jsonError("El título es obligatorio");
	if (!categoryParsed.success) return jsonError("Categoría inválida");
	if (!(file instanceof File) || file.size === 0) {
		return jsonError("El archivo es obligatorio");
	}

	const stored = await saveUpload(id, file);
	const record = await prisma.document.create({
		data: {
			clientId: id,
			title,
			category: categoryParsed.data,
			fileName: stored.fileName,
			mimeType: stored.mimeType,
			path: stored.relativePath,
			size: stored.size,
			notes: notesRaw.length ? notesRaw : null,
		},
	});

	return Response.json(serializeDocument(record), { status: 201 });
}
