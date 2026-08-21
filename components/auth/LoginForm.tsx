"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	return (
		<form
			className="mt-10 grid gap-4"
			onSubmit={async (event) => {
				event.preventDefault();
				setError(null);
				setPending(true);
				try {
					const response = await fetch("/api/auth/login", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							username,
							password,
							next: searchParams.get("next"),
						}),
					});
					const payload = (await response.json().catch(() => null)) as {
						error?: string;
						next?: string;
					} | null;
					if (!response.ok) {
						setError(payload?.error ?? "No se pudo entrar");
						return;
					}
					router.replace(payload?.next || "/");
					router.refresh();
				} catch {
					setError("No se pudo entrar");
				} finally {
					setPending(false);
				}
			}}
		>
			<label className="block text-[11px] tracking-[0.16em] text-copper-soft uppercase">
				Usuario
				<input
					value={username}
					onChange={(event) => setUsername(event.target.value)}
					autoComplete="username"
					required
					className="field mt-1"
				/>
			</label>
			<label className="block text-[11px] tracking-[0.16em] text-copper-soft uppercase">
				Contraseña
				<input
					type="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					autoComplete="current-password"
					required
					className="field mt-1"
				/>
			</label>
			{error ? <p className="text-sm text-danger">{error}</p> : null}
			<button type="submit" disabled={pending} className="btn-primary mt-2">
				{pending ? "Entrando…" : "Entrar"}
			</button>
		</form>
	);
}
