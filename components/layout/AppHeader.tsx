"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";

const navLinks = [
	{ href: "/", label: "Tablero" },
	{ href: "/clientes", label: "Listado" },
] as const;

export function AppHeader() {
	const pathname = usePathname();

	if (pathname === "/login") return null;

	return (
		<header className="relative sticky top-0 z-50 border-b border-white/10 bg-ink/92 pt-[env(safe-area-inset-top)] backdrop-blur-md">
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:items-end sm:px-6 sm:py-5">
				<Link href="/" className="group min-w-0">
					<p className="text-[10px] tracking-[0.28em] text-copper-soft uppercase sm:text-[11px]">
						Novalup
					</p>
					<h1 className="font-display truncate text-[1.65rem] leading-none text-paper group-hover:text-copper-soft sm:text-3xl">
						Libro de clientes
					</h1>
				</Link>
				<div className="flex shrink-0 items-center gap-1">
					<nav className="hidden items-center gap-1 text-sm lg:flex">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="px-3 py-1.5 text-paper/70 hover:text-paper"
							>
								{link.label}
							</Link>
						))}
						<ThemeToggle />
						<Link
							href="/clientes/nuevo"
							className="ml-1 bg-copper px-3 py-1.5 font-medium text-ink hover:bg-copper-soft"
						>
							Nuevo cliente
						</Link>
						<LogoutButton />
					</nav>
					<div className="flex items-center gap-1 lg:hidden">
						<ThemeToggle />
						<MobileMenu key={pathname} />
					</div>
				</div>
			</div>
		</header>
	);
}

function MobileMenu() {
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		if (!menuOpen) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMenuOpen(false);
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [menuOpen]);

	return (
		<>
			<button
				type="button"
				onClick={() => setMenuOpen((open) => !open)}
				className="flex size-11 items-center justify-center border border-white/15 text-paper"
				aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
				aria-expanded={menuOpen}
			>
				<MenuIcon open={menuOpen} />
			</button>
			{menuOpen ? (
				<div className="absolute inset-x-0 top-full border-t border-white/10 bg-ink lg:hidden">
					<nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setMenuOpen(false)}
								className="border-b border-white/8 py-3.5 text-base text-paper/85"
							>
								{link.label}
							</Link>
						))}
						<Link
							href="/clientes/nuevo"
							onClick={() => setMenuOpen(false)}
							className="mt-3 bg-copper px-4 py-3 text-center text-sm font-medium text-ink"
						>
							Nuevo cliente
						</Link>
						<LogoutButton className="mt-1 py-3.5 text-left text-base text-paper/55" />
					</nav>
				</div>
			) : null}
		</>
	);
}

function MenuIcon({ open }: { open: boolean }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-5 w-5"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="square"
		>
			{open ? (
				<path d="M6 6l12 12M18 6L6 18" />
			) : (
				<path d="M4 7h16M4 12h16M4 17h16" />
			)}
		</svg>
	);
}
