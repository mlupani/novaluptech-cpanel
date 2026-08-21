import { prisma } from "@/lib/db";
import { jsonError, serializeTask } from "@/lib/serialize";
import { taskUpdateSchema } from "@/lib/validations/client";

interface RouteContext {
	params: Promise<{ id: string; taskId: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
	const { id, taskId } = await params;
	const existing = await prisma.task.findFirst({
		where: { id: taskId, clientId: id },
	});
	if (!existing) return jsonError("Tarea no encontrada", 404);

	const body = await request.json().catch(() => null);
	const parsed = taskUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const record = await prisma.task.update({
		where: { id: taskId },
		data: parsed.data,
	});
	return Response.json(serializeTask(record));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const { id, taskId } = await params;
	const existing = await prisma.task.findFirst({
		where: { id: taskId, clientId: id },
	});
	if (!existing) return jsonError("Tarea no encontrada", 404);
	await prisma.task.delete({ where: { id: taskId } });
	return new Response(null, { status: 204 });
}
