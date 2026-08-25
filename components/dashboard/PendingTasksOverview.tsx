"use client";

import Link from "next/link";
import { StatCard } from "@/components/dashboard/Cards";
import { statusLabel } from "@/lib/labels";
import type { TodoTaskGroup } from "@/lib/queries";
import type { ClientStatus } from "@/types/client";

interface PendingTasksOverviewProps {
	groups: TodoTaskGroup[];
	totalTodo: number;
	clientsWithTodo: number;
	activeClientsWithTodo: number;
	inactiveClientsWithTodo: number;
	totalActiveTodo: number;
	totalInactiveTodo: number;
}

export function PendingTasksOverview({
	groups,
	totalTodo,
	clientsWithTodo,
	activeClientsWithTodo,
	inactiveClientsWithTodo,
	totalActiveTodo,
	totalInactiveTodo,
}: PendingTasksOverviewProps) {
	const maxCount = groups[0]?.tasks.length ?? 0;

	if (totalTodo === 0) {
		return (
			<section>
				<div className="mb-4 flex items-end justify-between gap-3">
					<div>
						<p className="text-[11px] tracking-[0.22em] text-copper-soft uppercase">
							Pendientes
						</p>
						<h3 className="font-display text-xl text-paper sm:text-2xl">
							Tareas por hacer
						</h3>
						<p className="mt-1 text-xs text-ink-muted">Incluye proyectos activos e inactivos</p>
					</div>
				</div>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard label="Por hacer" value={0} hint="Sin pendientes" />
					<StatCard label="Proyectos con pendientes" value={0} hint="Activos e inactivos" />
					<StatCard label="Inactivos con pendientes" value={0} hint="Pausados / cancelados" />
					<StatCard label="Promedio" value="—" hint="Incluye inactivos" />
				</div>
				<div className="mt-4 border border-dashed border-white/15 px-4 py-8">
					<p className="text-sm text-ink-muted">
						No hay tareas en estado “Por hacer”. Todo al día.
					</p>
				</div>
			</section>
		);
	}

	const topProject = groups[0];

	return (
		<section>
			<div className="mb-4 flex items-end justify-between gap-3">
				<div>
					<p className="text-[11px] tracking-[0.22em] text-copper-soft uppercase">
						Pendientes
					</p>
					<h3 className="font-display text-xl text-paper sm:text-2xl">
						Tareas por hacer
					</h3>
					<p className="mt-1 text-xs text-ink-muted">
						{totalTodo} tareas · {clientsWithTodo} proyectos · {activeClientsWithTodo} activos · {inactiveClientsWithTodo} inactivos · Estado “Por hacer”
					</p>
				</div>
				<span className="hidden text-xs tracking-widest text-ink-muted uppercase sm:inline">
					{clientsWithTodo} fichas · {inactiveClientsWithTodo} inactivas
				</span>
			</div>

			{/* KPIs - incluye activos e inactivos */}
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					label="Tareas por hacer"
					value={totalTodo}
					hint={`${totalActiveTodo} activas · ${totalInactiveTodo} inactivas`}
				/>
				<StatCard
					label="Proyectos con pendientes"
					value={clientsWithTodo}
					hint={
						topProject
							? `Top: ${topProject.company ?? topProject.clientName} · ${topProject.tasks.length}`
							: `${activeClientsWithTodo} activos · ${inactiveClientsWithTodo} inactivos`
					}
				/>
				<StatCard
					label="Inactivos con pendientes"
					value={inactiveClientsWithTodo}
					hint={
						inactiveClientsWithTodo > 0
							? `${totalInactiveTodo} tareas en pausados/cancelados`
							: "Sin tareas en inactivos"
					}
				/>
				<StatCard
					label="Promedio por proyecto"
					value={
						clientsWithTodo > 0
							? (totalTodo / clientsWithTodo).toFixed(1)
							: "—"
					}
					hint="Incluye activos e inactivos"
				/>
			</div>

			{/* Pantallazo por proyecto - incluye inactivos con badge */}
			<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
				{groups.map((group) => {
					const isInactive = group.status !== "activo";
					return (
					<Link
						key={group.clientId}
						href={`/clientes/${group.clientId}`}
						className={`group flex flex-col border p-4 hover:border-copper/50 ${
							isInactive ? "border-amber-500/25 bg-amber-500/[0.04]" : "border-white/10 bg-ink-soft/60"
						}`}
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p className="truncate text-sm font-medium text-paper group-hover:text-copper-soft">
									{group.company ?? group.clientName}
								</p>
								{group.company ? (
									<p className="truncate text-xs text-ink-muted">
										{group.clientName}
									</p>
								) : null}
								<span className={`mt-1 inline-flex border px-1.5 py-0.5 text-[10px] tracking-widest uppercase ${
									isInactive
										? "border-amber-500/30 bg-amber-500/10 text-amber-300/80"
										: "border-white/10 bg-white/5 text-ink-muted"
								}`}>
									{statusLabel[group.status as ClientStatus] ?? group.status}
								</span>
							</div>
							<span className={`shrink-0 border px-2 py-1 font-display text-xl leading-none ${
								isInactive ? "border-amber-500/30 bg-amber-500/15 text-amber-100" : "border-copper/30 bg-copper text-ink"
							}`}>
								{group.tasks.length}
							</span>
						</div>

						{/* Barra proporcional al max */}
						<div className="mt-3 h-1 bg-white/10">
							<div
								className="h-full bg-copper transition-all"
								style={{
									width: `${maxCount ? (group.tasks.length / maxCount) * 100 : 0}%`,
								}}
							/>
						</div>

						<ul className="mt-3 flex flex-col gap-1.5">
							{group.tasks.slice(0, 5).map((task) => (
								<li
									key={task.id}
									className="flex items-start gap-2 text-xs leading-snug text-paper/80"
								>
									<span className="mt-1.5 size-1 shrink-0 rounded-full bg-copper-soft" />
									<span className="line-clamp-2 flex-1">{task.title}</span>
								</li>
							))}
						</ul>
						{group.tasks.length > 5 ? (
							<p className="mt-2 text-[11px] text-copper-soft">
								+{group.tasks.length - 5} más · ver en workspace →
							</p>
						) : null}
					</Link>
					);
				})}
			</div>
		</section>
	);
}
