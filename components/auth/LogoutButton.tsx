"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
	const router = useRouter();

	return (
		<button
			type="button"
			className="px-3 py-1.5 text-paper/55 hover:text-paper"
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
