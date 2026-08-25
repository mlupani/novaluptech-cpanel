import { prisma } from "@/lib/db";
import {
	serializeClient,
	serializeInboxNote,
	serializeWorkspace,
} from "@/lib/serialize";

export async function getInboxNotes() {
	const records = await prisma.inboxNote.findMany({
		orderBy: [{ done: "asc" }, { createdAt: "desc" }],
	});
	return records.map(serializeInboxNote);
}

const workspaceInclude = {
	resources: { orderBy: { createdAt: "asc" as const } },
	socialLinks: { orderBy: { createdAt: "asc" as const } },
	documents: { orderBy: { createdAt: "desc" as const } },
	proposals: { orderBy: { createdAt: "desc" as const } },
	tasks: { orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }] },
};

export async function getClients() {
	const records = await prisma.client.findMany({
		orderBy: [{ status: "asc" }, { expirationDate: "asc" }],
	});
	return records.map(serializeClient);
}

export interface TodoTaskGroup {
	clientId: string;
	clientName: string;
	company: string | null;
	status: string;
	tasks: Array<{ id: string; title: string; createdAt: string }>;
}

export async function getTodoTasksOverview(): Promise<{
	groups: TodoTaskGroup[];
	totalTodo: number;
	clientsWithTodo: number;
	activeClientsWithTodo: number;
	inactiveClientsWithTodo: number;
	totalActiveTodo: number;
	totalInactiveTodo: number;
}> {
	const records = await prisma.task.findMany({
		where: { status: "todo" },
		orderBy: [{ createdAt: "desc" }],
		include: {
			client: {
				select: { id: true, name: true, company: true, status: true },
			},
		},
	});

	const map = new Map<string, TodoTaskGroup>();
	for (const r of records) {
		const existing = map.get(r.clientId);
		const task = {
			id: r.id,
			title: r.title,
			createdAt: r.createdAt.toISOString(),
		};
		if (existing) {
			existing.tasks.push(task);
		} else {
			map.set(r.clientId, {
				clientId: r.clientId,
				clientName: r.client.name,
				company: r.client.company,
				status: r.client.status,
				tasks: [task],
			});
		}
	}

	const groups = [...map.values()].sort(
		(a, b) => b.tasks.length - a.tasks.length,
	);

	const activeGroups = groups.filter((g) => g.status === "activo");
	const inactiveGroups = groups.filter((g) => g.status !== "activo");

	return {
		groups,
		totalTodo: records.length,
		clientsWithTodo: groups.length,
		activeClientsWithTodo: activeGroups.length,
		inactiveClientsWithTodo: inactiveGroups.length,
		totalActiveTodo: activeGroups.reduce((sum, g) => sum + g.tasks.length, 0),
		totalInactiveTodo: inactiveGroups.reduce((sum, g) => sum + g.tasks.length, 0),
	};
}

export async function getClientWorkspace(id: string) {
	const record = await prisma.client.findUnique({
		where: { id },
		include: workspaceInclude,
	});
	return record ? serializeWorkspace(record) : null;
}

export { workspaceInclude };
