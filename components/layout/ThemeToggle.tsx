"use client";

import { useLayoutEffect } from "react";
import { useUiStore } from "@/stores/ui-store";

export function ThemeToggle() {
	const theme = useUiStore((state) => state.theme);
	const toggleTheme = useUiStore((state) => state.toggleTheme);
	const hydrateTheme = useUiStore((state) => state.hydrateTheme);

	useLayoutEffect(() => {
		hydrateTheme();
	}, [hydrateTheme]);

	const isDark = theme === "dark";

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="mr-1 flex size-9 items-center justify-center border border-white/15 text-paper/75 hover:border-copper/60 hover:text-copper-soft"
			aria-label={isDark ? "Pasar a tema claro" : "Pasar a tema oscuro"}
			title={isDark ? "Tema claro" : "Tema oscuro"}
			suppressHydrationWarning
		>
			{isDark ? <SunIcon /> : <MoonIcon />}
		</button>
	);
}

function SunIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-[18px] w-[18px]"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="square"
		>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
		</svg>
	);
}

function MoonIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-[18px] w-[18px]"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="square"
			strokeLinejoin="miter"
		>
			<path d="M15.2 4.2A8.2 8.2 0 1 0 19.8 14 6.4 6.4 0 0 1 15.2 4.2Z" />
		</svg>
	);
}
