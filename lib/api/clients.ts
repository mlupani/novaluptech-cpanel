import type {
	Client,
	ClientCreateInput,
	ClientDocument,
	ClientUpdateInput,
	ClientWorkspace,
	Payment,
	Proposal,
	Resource,
	SocialLink,
	Task,
} from "@/types/client";

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

export const queryKeys = {
	clients: ["clients"] as const,
	client: (id: string) => ["clients", id] as const,
};

export function fetchClients() {
	return fetch("/api/clients").then((res) => parseJson<Client[]>(res));
}

export function fetchClient(id: string) {
	return fetch(`/api/clients/${id}`).then((res) =>
		parseJson<ClientWorkspace>(res),
	);
}

export function createClient(input: ClientCreateInput) {
	return fetch("/api/clients", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	}).then((res) => parseJson<ClientWorkspace>(res));
}

export function updateClient(id: string, input: ClientUpdateInput) {
	return fetch(`/api/clients/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	}).then((res) => parseJson<ClientWorkspace>(res));
}

export function deleteClient(id: string) {
	return fetch(`/api/clients/${id}`, { method: "DELETE" }).then((res) =>
		parseJson<void>(res),
	);
}

export function createResource(
	clientId: string,
	input: Pick<Resource, "kind" | "label" | "url" | "notes">,
) {
	return fetch(`/api/clients/${clientId}/resources`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	}).then((res) => parseJson<Resource>(res));
}

export function deleteResource(clientId: string, resourceId: string) {
	return fetch(`/api/clients/${clientId}/resources/${resourceId}`, {
		method: "DELETE",
	}).then((res) => parseJson<void>(res));
}

export function createSocial(
	clientId: string,
	input: Pick<SocialLink, "platform" | "url" | "handle">,
) {
	return fetch(`/api/clients/${clientId}/social`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	}).then((res) => parseJson<SocialLink>(res));
}

export function deleteSocial(clientId: string, socialId: string) {
	return fetch(`/api/clients/${clientId}/social/${socialId}`, {
		method: "DELETE",
	}).then((res) => parseJson<void>(res));
}

export function createProposal(clientId: string, form: FormData) {
	return fetch(`/api/clients/${clientId}/proposals`, {
		method: "POST",
		body: form,
	}).then((res) => parseJson<Proposal>(res));
}

export function deleteProposal(clientId: string, proposalId: string) {
	return fetch(`/api/clients/${clientId}/proposals/${proposalId}`, {
		method: "DELETE",
	}).then((res) => parseJson<void>(res));
}

export function createDocument(clientId: string, form: FormData) {
	return fetch(`/api/clients/${clientId}/documents`, {
		method: "POST",
		body: form,
	}).then((res) => parseJson<ClientDocument>(res));
}

export function deleteDocument(clientId: string, documentId: string) {
	return fetch(`/api/clients/${clientId}/documents/${documentId}`, {
		method: "DELETE",
	}).then((res) => parseJson<void>(res));
}

export function createTask(
	clientId: string,
	input: { title: string; status?: Task["status"] },
) {
	return fetch(`/api/clients/${clientId}/tasks`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	}).then((res) => parseJson<Task>(res));
}

export function updateTask(
	clientId: string,
	taskId: string,
	input: { title?: string; status?: Task["status"]; position?: number },
) {
	return fetch(`/api/clients/${clientId}/tasks/${taskId}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	}).then((res) => parseJson<Task>(res));
}

export function reorderTasks(
	clientId: string,
	tasks: Array<{ id: string; status: Task["status"]; position: number }>,
) {
	return fetch(`/api/clients/${clientId}/tasks`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ tasks }),
	}).then((res) => parseJson<Task[]>(res));
}

export function deleteTask(clientId: string, taskId: string) {
	return fetch(`/api/clients/${clientId}/tasks/${taskId}`, {
		method: "DELETE",
	}).then((res) => parseJson<void>(res));
}

export function createPayment(
	clientId: string,
	input: { amount: number; paidAt?: string | null; notes?: string | null },
) {
	return fetch(`/api/clients/${clientId}/payments`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	}).then((res) => parseJson<Payment>(res));
}
