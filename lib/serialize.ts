import type {
	Client,
	ClientDocument,
	ClientStatus,
	ClientWorkspace,
	Currency,
	Payment,
	Proposal,
	Resource,
	SocialLink,
	SubscriptionType,
	Task,
	TaskStatus,
} from "@/types/client";
import type { InboxNote } from "@/types/inbox";
import {
	calculateDaysRemaining,
	calculateExpirationDate,
	calculateMonthsRemaining,
	toDateOnly,
} from "@/lib/clientUtils";

interface DecimalLike {
	toString(): string;
}

interface ClientRecord {
	id: string;
	name: string;
	company: string | null;
	email: string | null;
	phone: string | null;
	whatsapp: string | null;
	status: string;
	startedAt: Date | null;
	notes: string | null;
	currency: string;
	monthlyAmount: DecimalLike | number;
	initialPayment: DecimalLike | number;
	subscriptionType: string;
	subscriptionDate: Date;
	expirationDate: Date;
	createdAt: Date;
	updatedAt: Date;
}

interface ResourceRecord {
	id: string;
	clientId: string;
	kind: string;
	label: string;
	url: string | null;
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface SocialRecord {
	id: string;
	clientId: string;
	platform: string;
	url: string;
	handle: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface DocumentRecord {
	id: string;
	clientId: string;
	title: string;
	category: string;
	fileName: string;
	mimeType: string;
	size: number;
	notes: string | null;
	createdAt: Date;
}

interface ProposalRecord {
	id: string;
	clientId: string;
	title: string;
	amount: DecimalLike | number | null;
	status: string;
	sentAt: Date | null;
	notes: string | null;
	fileName: string | null;
	mimeType: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface TaskRecord {
	id: string;
	clientId: string;
	title: string;
	status: string;
	position: number;
	createdAt: Date;
	updatedAt: Date;
}

interface PaymentRecord {
	id: string;
	clientId: string;
	amount: DecimalLike | number;
	paidAt: Date;
	notes: string | null;
	createdAt: Date;
}

export { toDateOnly } from "@/lib/clientUtils";

function toNumber(value: DecimalLike | number | null): number | null {
	if (value == null) return null;
	return typeof value === "number" ? value : Number(value.toString());
}

export function serializeClient(record: ClientRecord): Client {
	const subscriptionDate = toDateOnly(record.subscriptionDate);
	const subscriptionType = record.subscriptionType as SubscriptionType;
	const baseline = calculateExpirationDate(subscriptionDate, subscriptionType);
	const storedExpiration = toDateOnly(record.expirationDate);
	const expirationDate =
		storedExpiration > baseline ? storedExpiration : baseline;
	const daysRemaining = calculateDaysRemaining(expirationDate);

	return {
		id: record.id,
		name: record.name,
		company: record.company,
		email: record.email,
		phone: record.phone,
		whatsapp: record.whatsapp,
		status: record.status as ClientStatus,
		startedAt: record.startedAt ? toDateOnly(record.startedAt) : null,
		notes: record.notes,
		currency: record.currency as Currency,
		monthlyAmount: toNumber(record.monthlyAmount) ?? 0,
		initialPayment: toNumber(record.initialPayment) ?? 0,
		subscriptionType,
		subscriptionDate,
		expirationDate,
		daysRemaining,
		monthsRemaining:
			record.subscriptionType === "anual"
				? calculateMonthsRemaining(expirationDate)
				: undefined,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export function serializeResource(record: ResourceRecord): Resource {
	return {
		id: record.id,
		clientId: record.clientId,
		kind: record.kind as Resource["kind"],
		label: record.label,
		url: record.url,
		notes: record.notes,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export function serializeSocial(record: SocialRecord): SocialLink {
	return {
		id: record.id,
		clientId: record.clientId,
		platform: record.platform as SocialLink["platform"],
		url: record.url,
		handle: record.handle,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export function serializeDocument(record: DocumentRecord): ClientDocument {
	return {
		id: record.id,
		clientId: record.clientId,
		title: record.title,
		category: record.category as ClientDocument["category"],
		fileName: record.fileName,
		mimeType: record.mimeType,
		size: record.size,
		notes: record.notes,
		createdAt: record.createdAt.toISOString(),
	};
}

export function serializeProposal(record: ProposalRecord): Proposal {
	return {
		id: record.id,
		clientId: record.clientId,
		title: record.title,
		amount: toNumber(record.amount),
		status: record.status as Proposal["status"],
		sentAt: record.sentAt ? toDateOnly(record.sentAt) : null,
		notes: record.notes,
		fileName: record.fileName,
		mimeType: record.mimeType,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export function serializeTask(record: TaskRecord): Task {
	return {
		id: record.id,
		clientId: record.clientId,
		title: record.title,
		status: record.status as TaskStatus,
		position: record.position,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export function serializePayment(record: PaymentRecord): Payment {
	return {
		id: record.id,
		clientId: record.clientId,
		amount: toNumber(record.amount) ?? 0,
		paidAt: toDateOnly(record.paidAt),
		notes: record.notes,
		createdAt: record.createdAt.toISOString(),
	};
}

interface InboxNoteRecord {
	id: string;
	title: string;
	done: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export function serializeInboxNote(record: InboxNoteRecord): InboxNote {
	return {
		id: record.id,
		title: record.title,
		done: record.done,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export function serializeWorkspace(
	record: ClientRecord & {
		resources: ResourceRecord[];
		socialLinks: SocialRecord[];
		documents: DocumentRecord[];
		proposals: ProposalRecord[];
		tasks: TaskRecord[];
		payments: PaymentRecord[];
	},
): ClientWorkspace {
	return {
		...serializeClient(record),
		resources: record.resources.map(serializeResource),
		socialLinks: record.socialLinks.map(serializeSocial),
		documents: record.documents.map(serializeDocument),
		proposals: record.proposals.map(serializeProposal),
		tasks: record.tasks.map(serializeTask),
		payments: [...record.payments]
			.sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1))
			.map(serializePayment),
	};
}

export function jsonError(message: string, status = 400) {
	return Response.json({ error: message }, { status });
}
