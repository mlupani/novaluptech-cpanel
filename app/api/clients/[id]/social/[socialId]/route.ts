import { prisma } from "@/lib/db";
import { jsonError, serializeSocial } from "@/lib/serialize";
import { socialUpdateSchema } from "@/lib/validations/client";

interface RouteContext {
	params: Promise<{ id: string; socialId: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
	const { id, socialId } = await params;
	const existing = await prisma.socialLink.findFirst({
		where: { id: socialId, clientId: id },
	});
	if (!existing) return jsonError("Red no encontrada", 404);

	const body = await request.json().catch(() => null);
	const parsed = socialUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const record = await prisma.socialLink.update({
		where: { id: socialId },
		data: parsed.data,
	});
	return Response.json(serializeSocial(record));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const { id, socialId } = await params;
	const existing = await prisma.socialLink.findFirst({
		where: { id: socialId, clientId: id },
	});
	if (!existing) return jsonError("Red no encontrada", 404);
	await prisma.socialLink.delete({ where: { id: socialId } });
	return new Response(null, { status: 204 });
}
