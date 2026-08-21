import type {
	ClientStatus,
	DocumentCategory,
	ProposalStatus,
	ResourceKind,
	SocialPlatform,
	SubscriptionType,
	TaskStatus,
} from "@/types/client";

export const statusLabel: Record<ClientStatus, string> = {
	activo: "Activo",
	pausado: "En pausa",
	cancelado: "Cancelado",
};

export const subscriptionLabel: Record<SubscriptionType, string> = {
	mensual: "Mensual",
	anual: "Anual",
};

export const resourceLabel: Record<ResourceKind, string> = {
	website: "Sitio web",
	app: "App",
	domain: "Dominio",
	hosting: "Hosting",
	repository: "Repositorio",
	analytics: "Analytics",
	search_console: "Search Console",
	other: "Otro",
};

export const socialLabel: Record<SocialPlatform, string> = {
	instagram: "Instagram",
	facebook: "Facebook",
	linkedin: "LinkedIn",
	tiktok: "TikTok",
	x: "X",
	whatsapp: "WhatsApp",
	other: "Otra",
};

export const documentLabel: Record<DocumentCategory, string> = {
	documentation: "Documentación",
	contract: "Contrato",
	other: "Otro",
};

export const proposalLabel: Record<ProposalStatus, string> = {
	draft: "Borrador",
	sent: "Enviada",
	accepted: "Aceptada",
	rejected: "Rechazada",
};

export const taskColumns: { id: TaskStatus; label: string }[] = [
	{ id: "todo", label: "Por hacer" },
	{ id: "in_progress", label: "En progreso" },
	{ id: "testing", label: "A testear" },
	{ id: "done", label: "Finalizado" },
	{ id: "production", label: "En producción" },
];
