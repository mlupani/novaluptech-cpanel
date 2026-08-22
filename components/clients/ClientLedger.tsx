"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Client } from "@/types/client";
import { fetchClients, queryKeys } from "@/lib/api/clients";
import { formatDate, formatMoney, getUrgencyLevel } from "@/lib/clientUtils";
import { statusLabel, subscriptionLabel } from "@/lib/labels";
import { useUiStore } from "@/stores/ui-store";

interface ClientLedgerProps {
	initialClients: Client[];
}

export function ClientLedger({ initialClients }: ClientLedgerProps) {
	const router = useRouter();
	const { listFilters, setListFilters } = useUiStore();

	const { data: clients = initialClients } = useQuery({
		queryKey: queryKeys.clients,
		queryFn: fetchClients,
		initialData: initialClients,
	});

	const filtered = useMemo(() => {
		return clients
			.filter((client) => {
				const haystack = `${client.name} ${client.company ?? ""}`.toLowerCase();
				if (
					listFilters.search &&
					!haystack.includes(listFilters.search.toLowerCase())
				) {
					return false;
				}
				if (
					listFilters.status !== "all" &&
					client.status !== listFilters.status
				) {
					return false;
				}
				if (
					listFilters.subscriptionType !== "all" &&
					client.subscriptionType !== listFilters.subscriptionType
				) {
					return false;
				}
				return true;
			})
			.sort((a, b) => a.daysRemaining - b.daysRemaining);
	}, [clients, listFilters]);

	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
			<div className="mb-8 flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="text-[11px] tracking-[0.28em] text-copper-soft uppercase">
						Cartera
					</p>
					<h2 className="font-display mt-2 text-4xl text-paper sm:text-5xl">
						Listado
					</h2>
					<p className="mt-3 max-w-md text-sm text-paper/70">
						Vista compacta. Cada ficha abre el workspace del cliente.
					</p>
				</div>
				<Link
					href="/clientes/nuevo"
					className="inline-flex min-h-11 items-center justify-center bg-copper px-4 py-2 text-sm font-medium text-ink hover:bg-copper-soft sm:w-fit"
				>
					Nuevo cliente
				</Link>
			</div>

			{clients.length === 0 ? (
				<div className="border border-dashed border-white/15 px-6 py-14 text-center">
					<p className="font-display text-2xl text-paper">Cartera vacía</p>
					<p className="mx-auto mt-2 max-w-md text-sm text-paper/70">
						Creá el primer cliente. Después completás cobro, productos y
						documentos en su workspace.
					</p>
					<Link
						href="/clientes/nuevo"
						className="btn-primary mt-6 inline-block"
					>
						Nuevo cliente
					</Link>
				</div>
			) : (
				<>
					<div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
						<input
							value={listFilters.search}
							onChange={(event) =>
								setListFilters({ search: event.target.value })
							}
							placeholder="Buscar"
							className="field w-full sm:w-52 sm:min-h-0"
						/>
						<select
							value={listFilters.status}
							onChange={(event) =>
								setListFilters({
									status: event.target.value as typeof listFilters.status,
								})
							}
							className="field w-full sm:w-auto sm:min-h-0"
						>
							<option value="all">Todos los estados</option>
							<option value="activo">Activo</option>
							<option value="pausado">En pausa</option>
							<option value="cancelado">Cancelado</option>
						</select>
						<select
							value={listFilters.subscriptionType}
							onChange={(event) =>
								setListFilters({
									subscriptionType:
										event.target.value as typeof listFilters.subscriptionType,
								})
							}
							className="field w-full sm:w-auto sm:min-h-0"
						>
							<option value="all">Mensual y anual</option>
							<option value="mensual">Mensual</option>
							<option value="anual">Anual</option>
						</select>
					</div>

					<ul className="grid gap-2 md:hidden">
						{filtered.map((client) => {
							const level = getUrgencyLevel(client.daysRemaining);
							const tone =
								level === "critical"
									? "text-danger"
									: level === "warning"
										? "text-warn"
										: "text-paper/80";
							return (
								<li key={client.id}>
									<Link
										href={`/clientes/${client.id}`}
										className="block border border-white/10 bg-ink-soft/50 p-4"
									>
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="truncate text-paper">
													{client.company ?? "—"}
												</p>
												<p className="truncate text-sm text-paper/70">
													{client.name}
												</p>
											</div>
											<p className={`shrink-0 text-right text-sm ${tone}`}>
												{client.daysRemaining}d
											</p>
										</div>
										<div className="mt-3 flex items-end justify-between gap-3 text-xs text-ink-muted">
											<span>
												{statusLabel[client.status]} ·{" "}
												{subscriptionLabel[client.subscriptionType]}
											</span>
											<span className="text-copper-soft">
												{formatMoney(client.monthlyAmount, client.currency)}
											</span>
										</div>
										<p className={`mt-1 text-xs ${tone}`}>
											Vence {formatDate(client.expirationDate)}
										</p>
									</Link>
								</li>
							);
						})}
					</ul>

					<div className="hidden overflow-x-auto border border-white/10 md:block">
						<table className="w-full min-w-[720px] text-left text-sm">
							<thead className="bg-ink-soft text-[11px] tracking-[0.18em] text-copper-soft uppercase">
								<tr>
									<th className="px-4 py-3 font-medium">Proyecto</th>
									<th className="px-4 py-3 font-medium">Cliente</th>
									<th className="px-4 py-3 font-medium">Estado</th>
									<th className="px-4 py-3 font-medium">Vence</th>
									<th className="px-4 py-3 font-medium text-right">Mensual</th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((client) => {
									const level = getUrgencyLevel(client.daysRemaining);
									const tone =
										level === "critical"
											? "text-danger"
											: level === "warning"
												? "text-warn"
												: "text-paper/80";
									return (
										<tr
											key={client.id}
											className="cursor-pointer border-t border-white/8 hover:bg-white/5"
											onClick={() => router.push(`/clientes/${client.id}`)}
										>
											<td className="px-4 py-3 text-paper">
												{client.company ?? "—"}
											</td>
											<td className="px-4 py-3 text-paper/80">{client.name}</td>
											<td className="px-4 py-3 text-xs tracking-wide uppercase">
												{statusLabel[client.status]} ·{" "}
												{subscriptionLabel[client.subscriptionType]}
											</td>
											<td className={`px-4 py-3 ${tone}`}>
												{formatDate(client.expirationDate)}
												<span className="ml-2 text-xs">
													{client.daysRemaining}d
												</span>
											</td>
											<td className="px-4 py-3 text-right text-copper-soft">
												{formatMoney(client.monthlyAmount, client.currency)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
						{filtered.length === 0 ? (
							<p className="px-4 py-8 text-sm text-ink-muted">
								No hay clientes con esos filtros.
							</p>
						) : null}
					</div>
					{filtered.length === 0 ? (
						<p className="px-1 py-6 text-sm text-ink-muted md:hidden">
							No hay clientes con esos filtros.
						</p>
					) : null}
					<p className="mt-4 text-xs text-ink-muted">
						{filtered.length} de {clients.length}
					</p>
				</>
			)}
		</main>
	);
}
