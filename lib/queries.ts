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

export async function getClientWorkspace(id: string) {
	const record = await prisma.client.findUnique({
		where: { id },
		include: workspaceInclude,
	});
	return record ? serializeWorkspace(record) : null;
}

export { workspaceInclude };
