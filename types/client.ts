export type ClientStatus = "activo" | "pausado" | "cancelado";
export type SubscriptionType = "mensual" | "anual";
export type Currency = "ARS" | "USD";
export type ResourceKind =
	| "website"
	| "app"
	| "domain"
	| "hosting"
	| "repository"
	| "analytics"
	| "search_console"
	| "other";
export type SocialPlatform =
	| "instagram"
	| "facebook"
	| "linkedin"
	| "tiktok"
	| "x"
	| "whatsapp"
	| "other";
export type DocumentCategory = "documentation" | "contract" | "other";
export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected";
export type TaskStatus =
	| "todo"
	| "in_progress"
	| "testing"
	| "done"
	| "production";
export type UrgencyLevel = "critical" | "warning" | "safe";

export interface Client {
	id: string;
	name: string;
	company: string | null;
	email: string | null;
	phone: string | null;
	whatsapp: string | null;
	status: ClientStatus;
	startedAt: string | null;
	notes: string | null;
	currency: Currency;
	monthlyAmount: number;
	initialPayment: number;
	subscriptionType: SubscriptionType;
	subscriptionDate: string;
	expirationDate: string;
	daysRemaining: number;
	monthsRemaining?: number;
	createdAt: string;
	updatedAt: string;
}

export interface Resource {
	id: string;
	clientId: string;
	kind: ResourceKind;
	label: string;
	url: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface SocialLink {
	id: string;
	clientId: string;
	platform: SocialPlatform;
	url: string;
	handle: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ClientDocument {
	id: string;
	clientId: string;
	title: string;
	category: DocumentCategory;
	fileName: string;
	mimeType: string;
	size: number;
	notes: string | null;
	createdAt: string;
}

export interface Proposal {
	id: string;
	clientId: string;
	title: string;
	amount: number | null;
	status: ProposalStatus;
	sentAt: string | null;
	notes: string | null;
	fileName: string | null;
	mimeType: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Task {
	id: string;
	clientId: string;
	title: string;
	status: TaskStatus;
	position: number;
	createdAt: string;
	updatedAt: string;
}

export interface ClientWorkspace extends Client {
	resources: Resource[];
	socialLinks: SocialLink[];
	documents: ClientDocument[];
	proposals: Proposal[];
	tasks: Task[];
}

export interface ClientCreateInput {
	name: string;
	company?: string | null;
	email?: string | null;
	phone?: string | null;
	whatsapp?: string | null;
	status?: ClientStatus;
	startedAt?: string | null;
	notes?: string | null;
	currency?: Currency;
	monthlyAmount?: number;
	initialPayment?: number;
	subscriptionType?: SubscriptionType;
	subscriptionDate?: string;
	expirationDate?: string;
}

export interface ClientUpdateInput {
	name?: string;
	company?: string | null;
	email?: string | null;
	phone?: string | null;
	whatsapp?: string | null;
	status?: ClientStatus;
	startedAt?: string | null;
	notes?: string | null;
	currency?: Currency;
	monthlyAmount?: number;
	initialPayment?: number;
	subscriptionType?: SubscriptionType;
	subscriptionDate?: string;
	expirationDate?: string;
}
