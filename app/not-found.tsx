export default function NotFound() {
	return (
		<main className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-20">
			<p className="text-[11px] tracking-[0.24em] text-copper-soft uppercase">
				404
			</p>
			<h2 className="font-display mt-2 text-3xl text-paper sm:text-4xl">
				Ese workspace no existe.
			</h2>
			<a href="/clientes" className="mt-6 inline-block text-sm text-copper-soft">
				Volver al listado
			</a>
		</main>
	);
}
