"use client";

import { useRouter } from "next/navigation";

interface LogoutButtonProps {
	className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
	const router = useRouter();

	return (
		<button
			type="button"
			className={className ?? "px-3 py-1.5 text-paper/55 hover:text-paper"}
			onClick={async () => {
				await fetch("/api/auth/logout", { method: "POST" });
				router.replace("/login");
				router.refresh();
			}}
		>
			Salir
		</button>
	);
}
