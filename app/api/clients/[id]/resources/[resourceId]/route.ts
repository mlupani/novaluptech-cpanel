import { prisma } from "@/lib/db";
import { jsonError, serializeResource } from "@/lib/serialize";
import { resourceUpdateSchema } from "@/lib/validations/client";

interface RouteContext {
	params: Promise<{ id: string; resourceId: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
	const { id, resourceId } = await params;
	const existing = await prisma.resource.findFirst({
		where: { id: resourceId, clientId: id },
	});
	if (!existing) return jsonError("Recurso no encontrado", 404);

	const body = await request.json().catch(() => null);
	const parsed = resourceUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const record = await prisma.resource.update({
		where: { id: resourceId },
		data: parsed.data,
	});
	return Response.json(serializeResource(record));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const { id, resourceId } = await params;
	const existing = await prisma.resource.findFirst({
		where: { id: resourceId, clientId: id },
	});
	if (!existing) return jsonError("Recurso no encontrado", 404);
	await prisma.resource.delete({ where: { id: resourceId } });
	return new Response(null, { status: 204 });
}
