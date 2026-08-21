"use client";

import Link from "next/link";
import type { Client } from "@/types/client";
import { statusLabel } from "@/lib/labels";
import { useUiStore } from "@/stores/ui-store";

interface WorkspaceSwitcherProps {
	clients: Client[];
	currentId: string;
}

export function WorkspaceSwitcher({
	clients,
	currentId,
}: WorkspaceSwitcherProps) {
	const { sidebarOpen, toggleSidebar } = useUiStore();

	return (
		<aside
			className={`${sidebarOpen ? "w-64" : "w-14"} shrink-0 border-r border-white/10 bg-ink-soft/40`}
		>
			<div className="flex items-center justify-between px-3 py-4">
				{sidebarOpen ? (
					<p className="text-[11px] tracking-[0.2em] text-copper-soft uppercase">
						Workspaces
					</p>
				) : null}
				<button
					type="button"
					onClick={toggleSidebar}
					className="text-xs text-ink-muted hover:text-paper"
					aria-label="Alternar listado"
				>
					{sidebarOpen ? "«" : "»"}
				</button>
			</div>
			<nav className="flex flex-col">
				{clients.map((client) => {
					const active = client.id === currentId;
					return (
						<Link
							key={client.id}
							href={`/clientes/${client.id}`}
							title={client.company ?? client.name}
							className={`border-l-2 px-3 py-2 text-sm ${
								active
									? "border-copper bg-copper/10 text-paper"
									: "border-transparent text-paper/60 hover:bg-white/5 hover:text-paper"
							}`}
						>
							{sidebarOpen ? (
								<>
									<p className="truncate">{client.company ?? client.name}</p>
									<p className="text-[10px] tracking-wide text-ink-muted uppercase">
										{statusLabel[client.status]}
									</p>
								</>
							) : (
								<span className="block text-center">
									{(client.company ?? client.name).slice(0, 1)}
								</span>
							)}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
