import { prisma } from "@/lib/db";
import { jsonError, serializeTask } from "@/lib/serialize";
import { taskCreateSchema, taskReorderSchema } from "@/lib/validations/client";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
	const { id } = await params;
	const records = await prisma.task.findMany({
		where: { clientId: id },
		orderBy: [{ position: "asc" }, { createdAt: "asc" }],
	});
	return Response.json(records.map(serializeTask));
}

export async function POST(request: Request, { params }: RouteContext) {
	const { id } = await params;
	const client = await prisma.client.findUnique({ where: { id } });
	if (!client) return jsonError("Cliente no encontrado", 404);

	const body = await request.json().catch(() => null);
	const parsed = taskCreateSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const status = parsed.data.status ?? "todo";
	const last = await prisma.task.findFirst({
		where: { clientId: id, status },
		orderBy: { position: "desc" },
	});

	const record = await prisma.task.create({
		data: {
			clientId: id,
			title: parsed.data.title,
			status,
			position: (last?.position ?? -1) + 1,
		},
	});

	return Response.json(serializeTask(record), { status: 201 });
}

export async function PATCH(request: Request, { params }: RouteContext) {
	const { id } = await params;
	const client = await prisma.client.findUnique({ where: { id } });
	if (!client) return jsonError("Cliente no encontrado", 404);

	const body = await request.json().catch(() => null);
	const parsed = taskReorderSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	await prisma.$transaction(
		parsed.data.tasks.map((task) =>
			prisma.task.updateMany({
				where: { id: task.id, clientId: id },
				data: { status: task.status, position: task.position },
			}),
		),
	);

	const records = await prisma.task.findMany({
		where: { clientId: id },
		orderBy: [{ position: "asc" }, { createdAt: "asc" }],
	});
	return Response.json(records.map(serializeTask));
}
