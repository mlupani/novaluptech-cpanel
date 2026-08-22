import type { Client, UrgencyLevel } from "@/types/client";
import { formatDate, formatMoney, getUrgencyLevel } from "@/lib/clientUtils";
import { statusLabel, subscriptionLabel } from "@/lib/labels";
import Link from "next/link";

interface StatCardProps {
	label: string;
	value: string | number;
	hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
	return (
		<article className="border border-white/10 bg-ink-soft/70 p-4 sm:p-5">
			<p className="text-[11px] tracking-[0.22em] text-copper-soft uppercase">
				{label}
			</p>
			<p className="font-display mt-2 text-3xl wrap-break-word text-paper sm:text-4xl">
				{value}
			</p>
			{hint ? <p className="mt-2 text-xs text-ink-muted">{hint}</p> : null}
		</article>
	);
}

interface ExpirationCardProps {
	client: Client;
}

const urgencyCopy: Record<UrgencyLevel, string> = {
	critical: "Crítico",
	warning: "Atención",
	safe: "En curso",
};

export function ExpirationCard({ client }: ExpirationCardProps) {
	const level = getUrgencyLevel(client.daysRemaining);
	const tone =
		level === "critical"
			? "text-danger"
			: level === "warning"
				? "text-warn"
				: "text-moss";

	return (
		<Link
			href={`/clientes/${client.id}`}
			className="block border border-white/10 bg-ink-soft/60 p-4 hover:border-copper/50"
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-sm text-paper">
						{client.company ?? client.name}
					</p>
					<p className="text-xs text-ink-muted">{client.name}</p>
				</div>
				<div className={`text-right ${tone}`}>
					<p className="font-display text-3xl leading-none">
						{client.daysRemaining}
					</p>
					<p className="text-[10px] tracking-widest uppercase">días</p>
				</div>
			</div>
			<div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-ink-muted">
				<span>{formatDate(client.expirationDate)}</span>
				<span>
					{subscriptionLabel[client.subscriptionType]} · {urgencyCopy[level]}
				</span>
			</div>
			<p className="mt-2 text-xs text-copper-soft">
				{formatMoney(client.monthlyAmount, client.currency)} ·{" "}
				{statusLabel[client.status]}
			</p>
		</Link>
	);
}
