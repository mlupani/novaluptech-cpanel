import { Suspense } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
	title: "Entrar — Novalup",
};

export default function LoginPage() {
	return (
		<main className="relative z-10 mx-auto flex min-h-[calc(100vh-1px)] max-w-7xl flex-col px-6 py-8">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-[11px] tracking-[0.28em] text-copper-soft uppercase">
						Novalup
					</p>
					<h1 className="font-display mt-2 text-5xl leading-none text-paper md:text-6xl">
						Libro de clientes
					</h1>
				</div>
				<ThemeToggle />
			</div>
			<div className="my-auto max-w-md py-16">
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
