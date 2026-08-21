"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ClientStatus } from "@/types/client";
import { createClient, queryKeys } from "@/lib/api/clients";

export function NewClientForm() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [name, setName] = useState("");
	const [company, setCompany] = useState("");
	const [status, setStatus] = useState<ClientStatus>("activo");

	const mutation = useMutation({
		mutationFn: createClient,
		onSuccess: async (created) => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.clients });
			router.push(`/clientes/${created.id}`);
			router.refresh();
		},
	});

	return (
		<form
			className="grid max-w-xl gap-4"
			onSubmit={(event) => {
				event.preventDefault();
				if (!name.trim()) return;
				mutation.mutate({
					name: name.trim(),
					company: company.trim() || null,
					status,
				});
			}}
		>
			<label className="block text-[11px] tracking-[0.16em] text-copper-soft uppercase">
				Nombre del cliente
				<input
					value={name}
					onChange={(event) => setName(event.target.value)}
					required
					placeholder="María González"
					className="field mt-1"
				/>
			</label>
			<label className="block text-[11px] tracking-[0.16em] text-copper-soft uppercase">
				Proyecto / empresa
				<input
					value={company}
					onChange={(event) => setCompany(event.target.value)}
					placeholder="Opcional"
					className="field mt-1"
				/>
			</label>
			<label className="block text-[11px] tracking-[0.16em] text-copper-soft uppercase">
				Estado
				<select
					value={status}
					onChange={(event) =>
						setStatus(event.target.value as ClientStatus)
					}
					className="field mt-1"
				>
					<option value="activo">Activo</option>
					<option value="pausado">En pausa</option>
					<option value="cancelado">Cancelado</option>
				</select>
			</label>
			{mutation.isError ? (
				<p className="text-sm text-danger">
					{(mutation.error as Error).message}
				</p>
			) : null}
			<button type="submit" disabled={mutation.isPending} className="btn-primary">
				{mutation.isPending ? "Creando…" : "Crear workspace"}
			</button>
		</form>
	);
}
