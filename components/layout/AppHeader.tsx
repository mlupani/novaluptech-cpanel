"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function AppHeader() {
	const pathname = usePathname();
	if (pathname === "/login") return null;

	return (
		<header className="border-b border-white/10">
			<div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-6 py-5">
				<Link href="/" className="group block">
					<p className="text-[11px] tracking-[0.28em] text-copper-soft uppercase">
						Novalup
					</p>
					<h1 className="font-display text-3xl leading-none text-paper group-hover:text-copper-soft">
						Libro de clientes
					</h1>
				</Link>
				<nav className="flex items-center gap-1 text-sm">
					<Link
						href="/"
						className="px-3 py-1.5 text-paper/70 hover:text-paper"
					>
						Tablero
					</Link>
					<Link
						href="/clientes"
						className="px-3 py-1.5 text-paper/70 hover:text-paper"
					>
						Listado
					</Link>
					<ThemeToggle />
					<Link
						href="/clientes/nuevo"
						className="ml-1 bg-copper px-3 py-1.5 font-medium text-ink hover:bg-copper-soft"
					>
						Nuevo cliente
					</Link>
					<LogoutButton />
				</nav>
			</div>
		</header>
	);
}
