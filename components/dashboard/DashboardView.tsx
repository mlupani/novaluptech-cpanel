"use client";

import { useMemo } from "react";
import type { Client } from "@/types/client";
import type { InboxNote } from "@/types/inbox";
import Link from "next/link";
import { formatMoney } from "@/lib/clientUtils";
import { ExpirationCard, StatCard } from "@/components/dashboard/Cards";
import { InboxNotes } from "@/components/dashboard/InboxNotes";

interface DashboardViewProps {
	clients: Client[];
	notes: InboxNote[];
}

export function DashboardView({ clients, notes }: DashboardViewProps) {
	const stats = useMemo(() => {
		const active = clients.filter((client) => client.status === "activo");
		const monthly = active.filter(
			(client) => client.subscriptionType === "mensual",
		);
		const annual = active.filter(
			(client) => client.subscriptionType === "anual",
		);
		const today = new Date();
		const expiringThisMonth = active.filter((client) => {
			const date = new Date(`${client.expirationDate}T00:00:00`);
			return (
				date.getMonth() === today.getMonth() &&
				date.getFullYear() === today.getFullYear()
			);
		});
		const mrr = active.reduce((sum, client) => sum + client.monthlyAmount, 0);

		return {
			totalActive: active.length,
			monthly: monthly.length,
			annual: annual.length,
			expiringThisMonth: expiringThisMonth.length,
			mrr,
		};
	}, [clients]);

	const upcoming = useMemo(
		() =>
			clients
				.filter((client) => client.status === "activo")
				.sort((a, b) => a.daysRemaining - b.daysRemaining)
				.slice(0, 8),
		[clients],
	);

	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
			<div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
				<div className="max-w-2xl">
					<p className="text-[11px] tracking-[0.28em] text-copper-soft uppercase">
						Tablero
					</p>
					<h2 className="font-display mt-2 text-[2.35rem] leading-[0.95] text-paper sm:text-5xl">
						El estudio, en un vistazo.
					</h2>
					<p className="mt-4 max-w-lg text-sm leading-relaxed text-paper/70">
						Renovaciones, honorarios y el pulso de cada workspace. El listado
						queda para el día a día; acá se ve lo que vence.
					</p>
				</div>
				<Link
					href="/clientes/nuevo"
					className="inline-flex min-h-11 items-center justify-center bg-copper px-4 py-2 text-sm font-medium text-ink hover:bg-copper-soft sm:w-fit"
				>
					Nuevo cliente
				</Link>
			</div>

			<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					label="Activos"
					value={stats.totalActive}
					hint={`${stats.monthly} mensuales · ${stats.annual} anuales`}
				/>
				<StatCard
					label="Honorarios / mes"
					value={formatMoney(stats.mrr, "ARS")}
					hint="Solo clientes activos"
				/>
				<StatCard
					label="Vencen este mes"
					value={stats.expiringThisMonth}
				/>
				<StatCard label="Cartera" value={clients.length} />
			</section>

			<section className="mt-12">
				<InboxNotes initialNotes={notes} />
			</section>

			<section className="mt-10 sm:mt-12">
				<div className="mb-4 flex items-end justify-between gap-3">
					<h3 className="font-display text-xl text-paper sm:text-2xl">
						Próximos Vencimientos
					</h3>
					<p className="text-xs tracking-widest text-ink-muted uppercase">
						{upcoming.length} fichas
					</p>
				</div>
				{upcoming.length === 0 ? (
					<div className="border border-dashed border-white/15 px-4 py-8">
						<p className="text-sm text-ink-muted">
							{clients.length === 0
								? "Todavía no hay clientes. Creá el primero para armar su workspace."
								: "No hay vencimientos activos."}
						</p>
						{clients.length === 0 ? (
							<Link
								href="/clientes/nuevo"
								className="btn-primary mt-4 inline-block"
							>
								Nuevo cliente
							</Link>
						) : null}
					</div>
				) : (
					<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
						{upcoming.map((client) => (
							<ExpirationCard key={client.id} client={client} />
						))}
					</div>
				)}
			</section>
		</main>
	);
}
