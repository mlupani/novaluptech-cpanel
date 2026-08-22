import { NewClientForm } from "@/components/clients/NewClientForm";
import Link from "next/link";

export default function NuevoClientePage() {
	return (
		<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
			<p className="text-[11px] tracking-[0.28em] text-copper-soft uppercase">
				Alta
			</p>
			<h2 className="font-display mt-2 text-4xl text-paper sm:text-5xl">
				Nuevo cliente
			</h2>
			<p className="mt-3 max-w-lg text-sm text-paper/70">
				Con el nombre alcanza. El resto —cobro, productos, docs— se completa
				en el workspace.
			</p>
			<div className="mt-8">
				<NewClientForm />
			</div>
			<Link
				href="/clientes"
				className="mt-8 inline-block text-sm text-ink-muted hover:text-paper"
			>
				Volver al listado
			</Link>
		</main>
	);
}
