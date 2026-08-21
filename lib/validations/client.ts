import { z } from "zod";

const emptyToNull = (value: string | null | undefined) => {
	if (value == null) return null;
	const trimmed = value.trim();
	return trimmed.length === 0 ? null : trimmed;
};

const optionalText = z
	.string()
	.optional()
	.nullable()
	.transform(emptyToNull);

export const clientStatusSchema = z.enum(["activo", "pausado", "cancelado"]);
export const subscriptionTypeSchema = z.enum(["mensual", "anual"]);
export const currencySchema = z.enum(["ARS", "USD"]);
export const resourceKindSchema = z.enum([
	"website",
	"app",
	"domain",
	"hosting",
	"repository",
	"analytics",
	"search_console",
	"other",
]);
export const socialPlatformSchema = z.enum([
	"instagram",
	"facebook",
	"linkedin",
	"tiktok",
	"x",
	"whatsapp",
	"other",
]);
export const documentCategorySchema = z.enum([
	"documentation",
	"contract",
	"other",
]);
export const proposalStatusSchema = z.enum([
	"draft",
	"sent",
	"accepted",
	"rejected",
]);

export const clientCreateSchema = z.object({
	name: z.string().trim().min(1, "El nombre es obligatorio"),
	company: optionalText,
	email: optionalText,
	phone: optionalText,
	whatsapp: optionalText,
	status: clientStatusSchema.optional(),
	startedAt: optionalText,
	notes: optionalText,
	currency: currencySchema.optional(),
	monthlyAmount: z.coerce.number().nonnegative().optional(),
	initialPayment: z.coerce.number().nonnegative().optional(),
	subscriptionType: subscriptionTypeSchema.optional(),
	subscriptionDate: optionalText,
	expirationDate: optionalText,
});

export const clientUpdateSchema = clientCreateSchema.partial().extend({
	name: z.string().trim().min(1).optional(),
});

export const resourceSchema = z.object({
	kind: resourceKindSchema,
	label: z.string().trim().min(1, "La etiqueta es obligatoria"),
	url: optionalText,
	notes: optionalText,
});

export const resourceUpdateSchema = resourceSchema.partial();

export const socialSchema = z.object({
	platform: socialPlatformSchema,
	url: z.string().trim().min(1, "La URL es obligatoria"),
	handle: optionalText,
});

export const socialUpdateSchema = socialSchema.partial();

export const proposalSchema = z.object({
	title: z.string().trim().min(1, "El título es obligatorio"),
	amount: z.coerce.number().nonnegative().optional().nullable(),
	status: proposalStatusSchema.optional(),
	sentAt: optionalText,
	notes: optionalText,
});

export const proposalUpdateSchema = proposalSchema.partial();

export const taskStatusSchema = z.enum([
	"todo",
	"in_progress",
	"testing",
	"done",
	"production",
]);

export const taskCreateSchema = z.object({
	title: z.string().trim().min(1, "El título es obligatorio"),
	status: taskStatusSchema.optional(),
});

export const taskUpdateSchema = z.object({
	title: z.string().trim().min(1).optional(),
	status: taskStatusSchema.optional(),
	position: z.coerce.number().int().nonnegative().optional(),
});

export const taskReorderSchema = z.object({
	tasks: z.array(
		z.object({
			id: z.string().min(1),
			status: taskStatusSchema,
			position: z.coerce.number().int().nonnegative(),
		}),
	),
});

export const inboxNoteCreateSchema = z.object({
	title: z.string().trim().min(1, "La nota es obligatoria"),
});

export const inboxNoteUpdateSchema = z.object({
	title: z.string().trim().min(1).optional(),
	done: z.boolean().optional(),
});
