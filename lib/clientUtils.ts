import type { SubscriptionType, UrgencyLevel } from "@/types/client";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

interface Ymd {
	y: number;
	m: number;
	d: number;
}

export function todayDateOnly(): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: TIME_ZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

export function toDateOnly(value: Date | string): string {
	if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
		return value.slice(0, 10);
	}
	const date = value instanceof Date ? value : new Date(value);
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function dateOnlyToUtc(value: string): Date {
	return new Date(`${value}T12:00:00.000Z`);
}

function parseYmd(value: string): Ymd {
	const [y, m, d] = value.split("-").map(Number);
	return { y, m, d };
}

function formatYmd({ y, m, d }: Ymd): string {
	return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addMonths(date: Ymd, months: number): Ymd {
	const index = date.m - 1 + months;
	const y = date.y + Math.floor(index / 12);
	const m = ((index % 12) + 12) % 12 + 1;
	return { y, m, d: Math.min(date.d, daysInMonth(y, m)) };
}

function addYears(date: Ymd, years: number): Ymd {
	const y = date.y + years;
	return { y, m: date.m, d: Math.min(date.d, daysInMonth(y, date.m)) };
}

export function calculateExpirationDate(
	subscriptionDate: string,
	subscriptionType: SubscriptionType,
): string {
	const start = parseYmd(subscriptionDate);
	const today = parseYmd(todayDateOnly());
	let due = start;

	if (subscriptionType === "mensual") {
		while (formatYmd(due) < formatYmd(today)) {
			due = addMonths(due, 1);
		}
	} else {
		while (formatYmd(due) < formatYmd(today)) {
			due = addYears(due, 1);
		}
	}

	return formatYmd(due);
}

export function calculateDaysRemaining(expirationDate: string): number {
	const today = Date.parse(`${todayDateOnly()}T00:00:00.000Z`);
	const expiration = Date.parse(`${expirationDate}T00:00:00.000Z`);
	return Math.round((expiration - today) / 86_400_000);
}

export function calculateMonthsRemaining(expirationDate: string): number {
	const today = parseYmd(todayDateOnly());
	const expiration = parseYmd(expirationDate);
	return (expiration.y - today.y) * 12 + (expiration.m - today.m);
}

export function countElapsedMonths(startDate: string): number {
	const today = todayDateOnly();
	if (!startDate || startDate > today) return 0;

	let count = 0;
	let cursor = parseYmd(startDate);
	while (formatYmd(cursor) <= today) {
		count += 1;
		cursor = addMonths(cursor, 1);
		if (count > 600) break;
	}
	return count;
}

export interface GeneratedRevenue {
	months: number;
	total: number;
}

export function calculateGeneratedRevenue(input: {
	initialPayment: number;
	monthlyAmount: number;
	startedAt: string | null;
	subscriptionDate: string;
}): GeneratedRevenue {
	const start = input.startedAt ?? input.subscriptionDate;
	const months = countElapsedMonths(start);
	return {
		months,
		total: input.initialPayment + input.monthlyAmount * months,
	};
}

export function getUrgencyLevel(daysRemaining: number): UrgencyLevel {
	if (daysRemaining < 7) return "critical";
	if (daysRemaining <= 15) return "warning";
	return "safe";
}

export function formatDate(dateString: string): string {
	const date = new Date(`${dateString}T12:00:00.000Z`);
	return date.toLocaleDateString("es-AR", {
		timeZone: "UTC",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

export function formatMoney(amount: number, currency: string): string {
	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}

export function whatsappHref(whatsapp: string): string {
	const digits = whatsapp.replace(/\D/g, "");
	return `https://wa.me/${digits}`;
}
