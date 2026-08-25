"use client";

import { useMemo } from "react";
import type { Client } from "@/types/client";
import type { InboxNote } from "@/types/inbox";
import Link from "next/link";
import { formatMoney } from "@/lib/clientUtils";
import { ExpirationCard, StatCard } from "@/components/dashboard/Cards";
import { InboxNotes } from "@/components/dashboard/InboxNotes";
import { PendingTasksOverview } from "@/components/dashboard/PendingTasksOverview";
import type { TodoTaskGroup } from "@/lib/queries";

interface DashboardViewProps {
	clients: Client[];
	notes: InboxNote[];
	todoOverview: {
		groups: TodoTaskGroup[];
		totalTodo: number;
		clientsWithTodo: number;
		activeClientsWithTodo: number;
		inactiveClientsWithTodo: number;
		totalActiveTodo: number;
		totalInactiveTodo: number;
	};
}

export function DashboardView({
	clients,
	notes,
	todoOverview,
}: DashboardViewProps) {
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
		<main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
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

			{/* Nuevo layout: blotter izquierda, KPIs derecha */}
			<div className="grid gap-6 lg:gap-8 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)] 2xl:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
				{/* Izquierda — Blotter */}
				<aside className="order-2 lg:order-1 lg:sticky lg:top-6">
					<div className="border border-white/10 bg-ink-soft/30 p-4 sm:p-5">
						<InboxNotes initialNotes={notes} />
					</div>
					<p className="mt-3 hidden text-center text-[11px] tracking-wide text-ink-muted lg:block">
						Notas rápidas · no pertenecen a un cliente
					</p>
				</aside>

				{/* Derecha — KPIs */}
				<div className="order-1 lg:order-2 min-w-0 space-y-10">
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

					<section>
						<PendingTasksOverview
							groups={todoOverview.groups}
							totalTodo={todoOverview.totalTodo}
							clientsWithTodo={todoOverview.clientsWithTodo}
							activeClientsWithTodo={todoOverview.activeClientsWithTodo}
							inactiveClientsWithTodo={todoOverview.inactiveClientsWithTodo}
							totalActiveTodo={todoOverview.totalActiveTodo}
							totalInactiveTodo={todoOverview.totalInactiveTodo}
						/>
					</section>

					<section>
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
							<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
								{upcoming.map((client) => (
									<ExpirationCard key={client.id} client={client} />
								))}
							</div>
						)}
					</section>
				</div>
			</div>
		</main>
	);
}
