import { prisma } from "@/lib/db";
import { jsonError, serializeProposal } from "@/lib/serialize";
import { proposalSchema } from "@/lib/validations/client";
import { saveUpload } from "@/lib/files";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
	const { id } = await params;
	const records = await prisma.proposal.findMany({
		where: { clientId: id },
		orderBy: { createdAt: "desc" },
	});
	return Response.json(records.map(serializeProposal));
}

export async function POST(request: Request, { params }: RouteContext) {
	const { id } = await params;
	const client = await prisma.client.findUnique({ where: { id } });
	if (!client) return jsonError("Cliente no encontrado", 404);

	const contentType = request.headers.get("content-type") ?? "";
	let payload: {
		title?: unknown;
		amount?: unknown;
		status?: unknown;
		sentAt?: unknown;
		notes?: unknown;
	};
	let file: File | null = null;

	if (contentType.includes("multipart/form-data")) {
		const form = await request.formData();
		payload = {
			title: form.get("title"),
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

	const parsed = proposalSchema.safeParse(payload);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const stored = file ? await saveUpload(id, file) : null;
	const record = await prisma.proposal.create({
		data: {
			clientId: id,
			title: parsed.data.title,
			amount: parsed.data.amount ?? null,
			status: parsed.data.status ?? "draft",
			sentAt: parsed.data.sentAt ? new Date(parsed.data.sentAt) : null,
			notes: parsed.data.notes,
			fileName: stored?.fileName,
			mimeType: stored?.mimeType,
			path: stored?.relativePath,
		},
	});

	return Response.json(serializeProposal(record), { status: 201 });
}
