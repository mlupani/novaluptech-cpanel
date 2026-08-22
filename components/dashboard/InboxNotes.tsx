"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { InboxNote } from "@/types/inbox";
import {
	createInboxNote,
	deleteInboxNote,
	fetchInboxNotes,
	inboxQueryKey,
	updateInboxNote,
} from "@/lib/api/notes";

interface InboxNotesProps {
	initialNotes: InboxNote[];
}

export function InboxNotes({ initialNotes }: InboxNotesProps) {
	const queryClient = useQueryClient();
	const [draft, setDraft] = useState("");
	const { data: notes = [] } = useQuery({
		queryKey: inboxQueryKey,
		queryFn: fetchInboxNotes,
		initialData: initialNotes,
	});

	const addMutation = useMutation({
		mutationFn: createInboxNote,
		onSuccess: async () => {
			setDraft("");
			await queryClient.invalidateQueries({ queryKey: inboxQueryKey });
		},
	});

	const toggleMutation = useMutation({
		mutationFn: ({ id, done }: { id: string; done: boolean }) =>
			updateInboxNote(id, { done }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: inboxQueryKey });
		},
	});

	const removeMutation = useMutation({
		mutationFn: deleteInboxNote,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: inboxQueryKey });
		},
	});

	const openCount = notes.filter((note) => !note.done).length;

	return (
		<section>
			<div className="mb-4 flex items-end justify-between gap-4">
				<div className="min-w-0">
					<p className="text-[11px] tracking-[0.22em] text-copper-soft uppercase">
						Blotter
					</p>
					<h3 className="font-display text-xl text-paper sm:text-2xl">
						Notas del estudio
					</h3>
				</div>
				<p className="text-xs tracking-widest text-ink-muted uppercase">
					{openCount} abiertas
				</p>
			</div>

			<form
				className="flex flex-col gap-2 sm:flex-row"
				onSubmit={(event) => {
					event.preventDefault();
					const title = draft.trim();
					if (!title || addMutation.isPending) return;
					addMutation.mutate(title);
				}}
			>
				<input
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					placeholder="Anotá algo suelto y Enter"
					className="field"
					aria-label="Nueva nota"
				/>
				<button
					type="submit"
					disabled={addMutation.isPending || !draft.trim()}
					className="btn-primary shrink-0"
				>
					Anotar
				</button>
			</form>
			<p className="mt-2 text-[11px] text-ink-muted">
				Para lo general: llamadas, trámites, recordatorios que no son de un
				cliente.
			</p>

			{notes.length === 0 ? (
				<div className="mt-6 border border-dashed border-white/15 px-4 py-8">
					<p className="text-sm text-ink-muted">
						El blotter está vacío. Escribí arriba y queda acá.
					</p>
				</div>
			) : (
				<ul className="mt-6 border-t border-white/10">
					{notes.map((note) => (
						<li
							key={note.id}
							className="flex items-start gap-3 border-b border-white/10 py-3"
						>
							<button
								type="button"
								onClick={() =>
									toggleMutation.mutate({ id: note.id, done: !note.done })
								}
								className={`mt-0.5 flex size-5 shrink-0 items-center justify-center border ${
									note.done
										? "border-copper bg-copper text-ink"
										: "border-white/30 text-transparent hover:border-copper-soft"
								}`}
								aria-label={
									note.done ? "Marcar como pendiente" : "Marcar como hecha"
								}
								aria-pressed={note.done}
							>
								<span className="text-[11px] leading-none">✓</span>
							</button>
							<p
								className={`min-w-0 flex-1 text-sm leading-snug ${
									note.done
										? "text-ink-muted line-through"
										: "text-paper"
								}`}
							>
								{note.title}
							</p>
							<button
								type="button"
								className="shrink-0 text-ink-muted hover:text-danger"
								onClick={() => {
									if (confirm(`¿Eliminar «${note.title}»?`)) {
										removeMutation.mutate(note.id);
									}
								}}
								aria-label="Eliminar nota"
							>
								<TrashIcon />
							</button>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

function TrashIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-4 w-4"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="square"
			strokeLinejoin="miter"
		>
			<path d="M4 7h16" />
			<path d="M9 7V5h6v2" />
			<path d="M6 7l1 13h10l1-13" />
			<path d="M10 11v6M14 11v6" />
		</svg>
	);
}
