import { prisma } from "@/lib/db";
import { workspaceInclude } from "@/lib/queries";
import { jsonError, serializeClient, serializeWorkspace } from "@/lib/serialize";
import { calculateExpirationDate, dateOnlyToUtc, todayDateOnly } from "@/lib/clientUtils";
import { clientCreateSchema } from "@/lib/validations/client";
import type { SubscriptionType } from "@/types/client";

export async function GET() {
	const records = await prisma.client.findMany({
		orderBy: [{ status: "asc" }, { expirationDate: "asc" }],
	});
	return Response.json(records.map(serializeClient));
}

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const parsed = clientCreateSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const data = parsed.data;
	const subscriptionType = (data.subscriptionType ?? "mensual") as SubscriptionType;
	const subscriptionDate = data.subscriptionDate ?? todayDateOnly();
	const expirationDate = calculateExpirationDate(
		subscriptionDate,
		subscriptionType,
	);
	const status = data.status ?? "activo";

	const record = await prisma.client.create({
		data: {
			name: data.name,
			company: data.company,
			email: data.email,
			phone: data.phone,
			whatsapp: data.whatsapp,
			status,
			startedAt: data.startedAt
				? dateOnlyToUtc(data.startedAt)
				: status === "activo"
					? dateOnlyToUtc(subscriptionDate)
					: null,
			notes: data.notes,
			currency: data.currency ?? "ARS",
			monthlyAmount: data.monthlyAmount ?? 0,
			initialPayment: data.initialPayment ?? 0,
			subscriptionType,
			subscriptionDate: dateOnlyToUtc(subscriptionDate),
			expirationDate: dateOnlyToUtc(expirationDate),
		},
		include: workspaceInclude,
	});

	return Response.json(serializeWorkspace(record), { status: 201 });
}
