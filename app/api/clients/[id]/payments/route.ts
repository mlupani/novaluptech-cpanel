import { prisma } from "@/lib/db";
import { jsonError, serializePayment } from "@/lib/serialize";
import {
	addSubscriptionPeriod,
	calculateExpirationDate,
	dateOnlyToUtc,
	toDateOnly,
	todayDateOnly,
} from "@/lib/clientUtils";
import { paymentCreateSchema } from "@/lib/validations/client";
import type { SubscriptionType } from "@/types/client";

interface RouteContext {
	params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
	const { id } = await params;
	const records = await prisma.payment.findMany({
		where: { clientId: id },
		orderBy: { paidAt: "desc" },
	});
	return Response.json(records.map(serializePayment));
}

export async function POST(request: Request, { params }: RouteContext) {
	const { id } = await params;
	const client = await prisma.client.findUnique({ where: { id } });
	if (!client) return jsonError("Cliente no encontrado", 404);

	const body = await request.json().catch(() => null);
	const parsed = paymentCreateSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
	}

	const subscriptionType = client.subscriptionType as SubscriptionType;
	const baseline = calculateExpirationDate(
		toDateOnly(client.subscriptionDate),
		subscriptionType,
	);
	const storedExpiration = toDateOnly(client.expirationDate);
	const current =
		storedExpiration > baseline ? storedExpiration : baseline;
	const nextExpiration = addSubscriptionPeriod(current, subscriptionType);

	const record = await prisma.$transaction(async (tx) => {
		const payment = await tx.payment.create({
			data: {
				clientId: id,
				amount: parsed.data.amount,
				paidAt: dateOnlyToUtc(parsed.data.paidAt ?? todayDateOnly()),
				notes: parsed.data.notes,
			},
		});
		await tx.client.update({
			where: { id },
			data: { expirationDate: dateOnlyToUtc(nextExpiration) },
		});
		return payment;
	});

	return Response.json(serializePayment(record), { status: 201 });
}
