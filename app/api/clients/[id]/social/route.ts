import { prisma } from "@/lib/db";
import { jsonError, serializeSocial } from "@/lib/serialize";
import { socialSchema } from "@/lib/validations/client";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
	const { id } = await params;
	const records = await prisma.socialLink.findMany({
		where: { clientId: id },
		orderBy: { createdAt: "asc" },
	});
	return Response.json(records.map(serializeSocial));
}

export async function POST(request: Request, { params }: RouteContext) {
	const { id } = await params;
	const client = await prisma.client.findUnique({ where: { id } });
	if (!client) return jsonError("Cliente no encontrado", 404);

	const body = await request.json().catch(() => null);
	const parsed = socialSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const record = await prisma.socialLink.create({
		data: { ...parsed.data, clientId: id },
	});
	return Response.json(serializeSocial(record), { status: 201 });
}
