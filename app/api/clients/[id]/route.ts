import { prisma } from "@/lib/db";
import { workspaceInclude } from "@/lib/queries";
import { jsonError, serializeWorkspace } from "@/lib/serialize";
import { calculateExpirationDate, dateOnlyToUtc, toDateOnly } from "@/lib/clientUtils";
import { clientUpdateSchema } from "@/lib/validations/client";
import { removeUpload } from "@/lib/files";
import type { SubscriptionType } from "@/types/client";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
	const { id } = await params;
	const record = await prisma.client.findUnique({
		where: { id },
		include: workspaceInclude,
	});
	if (!record) return jsonError("Cliente no encontrado", 404);
	return Response.json(serializeWorkspace(record));
}

export async function PATCH(request: Request, { params }: RouteContext) {
	const { id } = await params;
	const existing = await prisma.client.findUnique({ where: { id } });
	if (!existing) return jsonError("Cliente no encontrado", 404);

	const body = await request.json().catch(() => null);
	const parsed = clientUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const data = parsed.data;
	const subscriptionType = (data.subscriptionType ??
		existing.subscriptionType) as SubscriptionType;
	const subscriptionDate = data.subscriptionDate
		? data.subscriptionDate
		: toDateOnly(existing.subscriptionDate);
	const expirationDate = calculateExpirationDate(
		subscriptionDate,
		subscriptionType,
	);

	const record = await prisma.client.update({
		where: { id },
		data: {
			name: data.name,
			company: data.company,
			email: data.email,
			phone: data.phone,
			whatsapp: data.whatsapp,
			status: data.status,
			startedAt:
				data.startedAt === undefined
					? undefined
					: data.startedAt
						? dateOnlyToUtc(data.startedAt)
						: null,
			notes: data.notes,
			currency: data.currency,
			monthlyAmount: data.monthlyAmount,
			initialPayment: data.initialPayment,
			subscriptionType: data.subscriptionType,
			subscriptionDate: data.subscriptionDate
				? dateOnlyToUtc(data.subscriptionDate)
				: undefined,
			expirationDate: dateOnlyToUtc(expirationDate),
		},
		include: workspaceInclude,
	});

	return Response.json(serializeWorkspace(record));
}

export async function DELETE(_request: Request, { params }: RouteContext) {
	const { id } = await params;
	const existing = await prisma.client.findUnique({
		where: { id },
		include: { documents: true, proposals: true },
	});
	if (!existing) return jsonError("Cliente no encontrado", 404);

	await Promise.all([
		...existing.documents.map((doc) => removeUpload(doc.path)),
		...existing.proposals
			.filter((proposal) => proposal.path)
			.map((proposal) => removeUpload(proposal.path as string)),
	]);

	await prisma.client.delete({ where: { id } });
	return new Response(null, { status: 204 });
}
