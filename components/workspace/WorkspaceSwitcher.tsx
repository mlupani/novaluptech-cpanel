"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Client, ClientStatus } from "@/types/client";
import { statusLabel } from "@/lib/labels";
import { useUiStore } from "@/stores/ui-store";

interface WorkspaceSwitcherProps {
	clients: Client[];
	currentId: string;
}

const statusDot: Record<ClientStatus, string> = {
	activo: "bg-moss",
	pausado: "bg-warn",
	cancelado: "bg-danger",
};

export function WorkspaceSwitcher({
	clients,
	currentId,
}: WorkspaceSwitcherProps) {
	const { sidebarOpen, toggleSidebar } = useUiStore();
	const current = clients.find((client) => client.id === currentId);

	return (
		<>
			<MobileSwitcher clients={clients} currentId={currentId} current={current} />
			<aside
				className={`${sidebarOpen ? "w-64" : "w-14"} hidden shrink-0 border-r border-white/10 bg-ink-soft/40 lg:block`}
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
					{clients.map((client) => (
						<ClientLink
							key={client.id}
							client={client}
							active={client.id === currentId}
							compact={!sidebarOpen}
						/>
					))}
				</nav>
			</aside>
		</>
	);
}

interface MobileSwitcherProps {
	clients: Client[];
	currentId: string;
	current: Client | undefined;
}

function MobileSwitcher({
	clients,
	currentId,
	current,
}: MobileSwitcherProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const currentLabel = current?.company ?? current?.name ?? "Workspace";

	useEffect(() => {
		setOpen(false);
		setQuery("");
	}, [currentId]);

	useEffect(() => {
		if (!open) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open]);

	const filtered = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return clients;
		return clients.filter((client) => {
			const haystack = `${client.company ?? ""} ${client.name}`.toLowerCase();
			return haystack.includes(needle);
		});
	}, [clients, query]);

	return (
		<div className="px-4 pt-3 lg:hidden">
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex min-h-12 w-full items-center gap-3 border border-white/15 bg-ink-soft px-3.5 py-2.5 text-left"
				aria-expanded={open}
				aria-haspopup="dialog"
			>
				<span
					className={`size-2 shrink-0 ${current ? statusDot[current.status] : "bg-ink-muted"}`}
					aria-hidden="true"
				/>
				<span className="min-w-0 flex-1">
					<span className="block text-[10px] tracking-[0.22em] text-copper-soft uppercase">
						Workspace
					</span>
					<span className="mt-0.5 block truncate text-sm text-paper">
						{currentLabel}
					</span>
				</span>
				<span className="shrink-0 text-[10px] tracking-[0.16em] text-ink-muted uppercase">
					{clients.length}
				</span>
				<ChevronIcon />
			</button>

			{open ? (
				<div className="fixed inset-0 z-60 lg:hidden">
					<button
						type="button"
						className="workspace-sheet-backdrop absolute inset-0 bg-ink/70"
						onClick={() => setOpen(false)}
						aria-label="Cerrar listado de workspaces"
					/>
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="workspace-sheet-title"
						className="workspace-sheet absolute inset-x-0 bottom-0 flex max-h-[min(34rem,88dvh)] flex-col border-t border-white/12 bg-ink-soft pb-[env(safe-area-inset-bottom)]"
					>
						<div className="flex justify-center pt-3">
							<span className="h-1 w-10 bg-white/20" aria-hidden="true" />
						</div>
						<div className="flex items-end justify-between gap-3 px-4 pt-3 pb-3">
							<div>
								<p
									id="workspace-sheet-title"
									className="text-[11px] tracking-[0.22em] text-copper-soft uppercase"
								>
									Workspaces
								</p>
								<p className="mt-0.5 text-sm text-paper/55">
									{clients.length}{" "}
									{clients.length === 1 ? "cliente" : "clientes"}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="flex size-11 items-center justify-center border border-white/15 text-paper/70"
								aria-label="Cerrar"
							>
								<CloseIcon />
							</button>
						</div>
						{clients.length > 6 ? (
							<div className="px-4 pb-3">
								<input
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Buscar cliente"
									className="field"
								/>
							</div>
						) : null}
						<nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
							{filtered.length === 0 ? (
								<p className="px-3 py-8 text-center text-sm text-ink-muted">
									Sin coincidencias
								</p>
							) : (
								filtered.map((client) => (
									<SheetClientLink
										key={client.id}
										client={client}
										active={client.id === currentId}
									/>
								))
							)}
						</nav>
					</div>
				</div>
			) : null}
		</div>
	);
}

interface ClientLinkProps {
	client: Client;
	active: boolean;
	compact: boolean;
}

function ClientLink({ client, active, compact }: ClientLinkProps) {
	return (
		<Link
			href={`/clientes/${client.id}`}
			title={client.company ?? client.name}
			className={`border-l-2 px-3 py-2.5 text-sm ${
				active
					? "border-copper bg-copper/10 text-paper"
					: "border-transparent text-paper/60 hover:bg-white/5 hover:text-paper"
			}`}
		>
			{compact ? (
				<span className="block text-center">
					{(client.company ?? client.name).slice(0, 1)}
				</span>
			) : (
				<>
					<p className="truncate">{client.company ?? client.name}</p>
					<p className="text-[10px] tracking-wide text-ink-muted uppercase">
						{statusLabel[client.status]}
					</p>
				</>
			)}
		</Link>
	);
}

function SheetClientLink({
	client,
	active,
}: {
	client: Client;
	active: boolean;
}) {
	const title = client.company ?? client.name;

	return (
		<Link
			href={`/clientes/${client.id}`}
			className={`mb-1 flex min-h-14 items-center gap-3 px-3 py-3 ${
				active
					? "bg-copper/10 text-paper"
					: "text-paper/80 active:bg-white/5"
			}`}
		>
			<span
				className={`size-2 shrink-0 ${statusDot[client.status]}`}
				aria-hidden="true"
			/>
			<span className="min-w-0 flex-1">
				<span className="block truncate text-[15px] leading-tight">
					{title}
				</span>
				{client.company && client.name !== client.company ? (
					<span className="mt-0.5 block truncate text-xs text-ink-muted">
						{client.name}
					</span>
				) : null}
			</span>
			<span
				className={`shrink-0 text-[10px] tracking-[0.14em] uppercase ${
					active ? "text-copper-soft" : "text-ink-muted"
				}`}
			>
				{statusLabel[client.status]}
			</span>
		</Link>
	);
}

function ChevronIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-4 w-4 shrink-0 text-ink-muted"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="square"
		>
			<path d="M6 9l6 6 6-6" />
		</svg>
	);
}

function CloseIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-4 w-4"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="square"
		>
			<path d="M6 6l12 12M18 6L6 18" />
		</svg>
	);
}
