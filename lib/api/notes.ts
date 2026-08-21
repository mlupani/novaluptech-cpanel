import type { InboxNote } from "@/types/inbox";

async function parseJson<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const payload = (await response.json().catch(() => null)) as {
			error?: string;
		} | null;
		throw new Error(payload?.error ?? "Error de red");
	}
	if (response.status === 204) return undefined as T;
	return response.json() as Promise<T>;
}

export const inboxQueryKey = ["inbox-notes"] as const;

export function fetchInboxNotes() {
	return fetch("/api/notes").then((res) => parseJson<InboxNote[]>(res));
}

export function createInboxNote(title: string) {
	return fetch("/api/notes", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ title }),
	}).then((res) => parseJson<InboxNote>(res));
}

export function updateInboxNote(
	id: string,
	input: { title?: string; done?: boolean },
) {
	return fetch(`/api/notes/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	}).then((res) => parseJson<InboxNote>(res));
}

export function deleteInboxNote(id: string) {
	return fetch(`/api/notes/${id}`, { method: "DELETE" }).then((res) =>
		parseJson<void>(res),
	);
}
