import { Suspense } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
	title: "Entrar — Novalup",
};

export default function LoginPage() {
	return (
		<main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-[11px] tracking-[0.28em] text-copper-soft uppercase">
						Novalup
					</p>
					<h1 className="font-display mt-2 text-[2.35rem] leading-[0.95] text-paper sm:text-5xl md:text-6xl">
						Libro de clientes
					</h1>
				</div>
				<ThemeToggle />
			</div>
			<div className="my-auto max-w-md py-10 sm:py-16">
				<p className="text-[11px] tracking-[0.22em] text-copper-soft uppercase">
					Acceso
				</p>
				<h2 className="font-display mt-2 text-3xl text-paper">
					El estudio, con llave.
				</h2>
				<p className="mt-3 text-sm leading-relaxed text-paper/70">
					Usuario y contraseña salen del entorno. Nada de cuentas: sos vos y el
					dossier.
				</p>
				<Suspense>
					<LoginForm />
				</Suspense>
			</div>
		</main>
	);
}
