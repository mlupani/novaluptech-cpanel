"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type {
	Client,
	ClientStatus,
	ClientWorkspace,
	Currency,
	DocumentCategory,
	ProposalStatus,
	ResourceKind,
	SocialPlatform,
	SubscriptionType,
} from "@/types/client";
import {
	createDocument,
	createPayment,
	createProposal,
	createResource,
	createSocial,
	deleteClient,
	deleteDocument,
	deleteProposal,
	deleteResource,
	deleteSocial,
	fetchClient,
	queryKeys,
	updateClient,
} from "@/lib/api/clients";
import {
	addSubscriptionPeriod,
	calculateDaysRemaining,
	calculateExpirationDate,
	calculateGeneratedRevenue,
	formatDate,
	formatMoney,
	getUrgencyLevel,
	todayDateOnly,
	whatsappHref,
} from "@/lib/clientUtils";
import {
	documentLabel,
	proposalLabel,
	resourceLabel,
	socialLabel,
	statusLabel,
} from "@/lib/labels";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";
import { TaskBoard } from "@/components/workspace/TaskBoard";
import type { WorkspaceSection } from "@/stores/ui-store";
import { useUiStore } from "@/stores/ui-store";

interface ClientWorkspaceViewProps {
	initialClient: ClientWorkspace;
	clients: Client[];
}

const sections: { id: WorkspaceSection; label: string }[] = [
	{ id: "contacto", label: "Contacto" },
	{ id: "cobro", label: "Cobro" },
	{ id: "productos", label: "Productos" },
	{ id: "redes", label: "Redes" },
	{ id: "documentos", label: "Documentos" },
	{ id: "propuestas", label: "Propuestas" },
];

const resourceKinds: ResourceKind[] = [
	"website",
	"app",
	"domain",
	"hosting",
	"repository",
	"analytics",
	"search_console",
	"other",
];

const socialPlatforms: SocialPlatform[] = [
	"instagram",
	"facebook",
	"linkedin",
	"tiktok",
	"x",
	"whatsapp",
	"other",
];

export function ClientWorkspaceView({
	initialClient,
	clients,
}: ClientWorkspaceViewProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { workspaceSection, setWorkspaceSection } = useUiStore();
	const { data: client = initialClient } = useQuery({
		queryKey: queryKeys.client(initialClient.id),
		queryFn: () => fetchClient(initialClient.id),
		initialData: {
			...initialClient,
			tasks: initialClient.tasks ?? [],
		},
	});

	const invalidate = async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: queryKeys.client(client.id) }),
			queryClient.invalidateQueries({ queryKey: queryKeys.clients }),
		]);
		router.refresh();
	};

	const saveMutation = useMutation({
		mutationFn: (payload: Parameters<typeof updateClient>[1]) =>
			updateClient(client.id, payload),
		onSuccess: invalidate,
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteClient(client.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.clients });
			router.push("/clientes");
		},
	});

	const urgency = getUrgencyLevel(client.daysRemaining);
	const urgencyClass =
		urgency === "critical"
			? "text-danger"
			: urgency === "warning"
				? "text-warn"
				: "text-moss";
	const revenue = calculateGeneratedRevenue({
		initialPayment: client.initialPayment,
		monthlyAmount: client.monthlyAmount,
		startedAt: client.startedAt,
		subscriptionDate: client.subscriptionDate,
	});

	return (
		<div className="flex min-h-[calc(100dvh-4.25rem)] flex-col lg:flex-row">
			<WorkspaceSwitcher clients={clients} currentId={client.id} />
			<div className="min-w-0 flex-1">
				<header className="border-b border-white/10 px-4 py-5 sm:px-6 md:px-10 md:py-6">
					<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
						<div className="min-w-0">
							<p className="hidden text-[11px] tracking-[0.24em] text-copper-soft uppercase lg:block">
								Workspace
							</p>
							<h2 className="font-display mt-1 text-[1.85rem] leading-[1.05] wrap-break-word text-paper sm:text-4xl md:text-5xl">
								{client.company ?? client.name}
							</h2>
							<p className="mt-2 text-sm text-paper/70">{client.name}</p>
						</div>
						<div className="flex flex-wrap items-center gap-3 text-sm sm:gap-4">
							<span className="border border-white/15 px-3 py-1 uppercase tracking-wide">
								{statusLabel[client.status]}
							</span>
							<span className={urgencyClass}>
								Vence {formatDate(client.expirationDate)} · {client.daysRemaining}d
							</span>
							{client.whatsapp ? (
								<a
									href={whatsappHref(client.whatsapp)}
									target="_blank"
									rel="noreferrer"
									className="inline-flex min-h-10 items-center bg-moss px-3 py-1 text-paper"
								>
									WhatsApp
								</a>
							) : null}
							<button
								type="button"
								onClick={() => {
									if (confirm("¿Eliminar este workspace y sus archivos?")) {
										deleteMutation.mutate();
									}
								}}
								className="text-xs text-danger hover:underline"
							>
								Eliminar
							</button>
						</div>
					</div>
					<div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3 xl:grid-cols-4">
						<div className="border border-copper/45 bg-copper/10 p-3">
							<p className="text-[10px] tracking-widest text-copper-soft uppercase">
								Ganancia
							</p>
							<p className="font-display text-xl wrap-break-word text-copper-soft sm:text-2xl">
								{formatMoney(revenue.total, client.currency)}
							</p>
							<p className="mt-1 text-[11px] text-paper/55">
								Inicial
								{revenue.months === 0
									? " · sin meses aún"
									: ` + ${revenue.months} ${revenue.months === 1 ? "mes" : "meses"}`}
							</p>
						</div>
						<div className="border border-white/10 p-3">
							<p className="text-[10px] tracking-widest text-ink-muted uppercase">
								Mensual
							</p>
							<p className="font-display text-xl wrap-break-word text-paper sm:text-2xl">
								{formatMoney(client.monthlyAmount, client.currency)}
							</p>
						</div>
						<div className="border border-white/10 p-3">
							<p className="text-[10px] tracking-widest text-ink-muted uppercase">
								Pago inicial
							</p>
							<p className="font-display text-xl wrap-break-word text-paper sm:text-2xl">
								{formatMoney(client.initialPayment, client.currency)}
							</p>
						</div>
						<div className="border border-white/10 p-3">
							<p className="text-[10px] tracking-widest text-ink-muted uppercase">
								Activo desde
							</p>
							<p className="font-display text-xl text-paper sm:text-2xl">
								{client.startedAt ? formatDate(client.startedAt) : "—"}
							</p>
						</div>
					</div>
				</header>

				<nav className="flex gap-1 overflow-x-auto border-b border-white/10 px-4 py-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-6 md:px-10 [&::-webkit-scrollbar]:hidden">
					{sections.map((section) => (
						<button
							key={section.id}
							type="button"
							onClick={() => setWorkspaceSection(section.id)}
							className={`shrink-0 px-3 py-2.5 text-sm ${
								workspaceSection === section.id
									? "text-copper-soft"
									: "text-paper/55 hover:text-paper"
							}`}
						>
							{section.label}
						</button>
					))}
				</nav>

				<div className="flex flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 md:px-10 lg:flex-row lg:items-start lg:gap-16">
					<div className="w-full min-w-0 max-w-3xl shrink-0">
						{workspaceSection === "contacto" ? (
							<ContactSection
								client={client}
								saving={saveMutation.isPending}
								onSave={(payload) => saveMutation.mutate(payload)}
							/>
						) : null}
					{workspaceSection === "cobro" ? (
						<BillingSection
							client={client}
							saving={saveMutation.isPending}
							onSave={(payload) => saveMutation.mutate(payload)}
							onChanged={invalidate}
						/>
					) : null}
						{workspaceSection === "productos" ? (
							<ResourcesSection client={client} onChanged={invalidate} />
						) : null}
						{workspaceSection === "redes" ? (
							<SocialSection client={client} onChanged={invalidate} />
						) : null}
						{workspaceSection === "documentos" ? (
							<DocumentsSection client={client} onChanged={invalidate} />
						) : null}
						{workspaceSection === "propuestas" ? (
							<ProposalsSection client={client} onChanged={invalidate} />
						) : null}
						{saveMutation.isError ? (
							<p className="mt-4 text-sm text-danger">
								{(saveMutation.error as Error).message}
							</p>
						) : null}
					</div>
					<TaskBoard client={client} />
				</div>
			</div>
		</div>
	);
}

interface SaveSectionProps {
	client: ClientWorkspace;
	saving: boolean;
	onSave: (payload: Parameters<typeof updateClient>[1]) => void;
}

function ContactSection({ client, saving, onSave }: SaveSectionProps) {
	const [form, setForm] = useState({
		name: client.name,
		company: client.company ?? "",
		email: client.email ?? "",
		phone: client.phone ?? "",
		whatsapp: client.whatsapp ?? "",
		status: client.status,
		startedAt: client.startedAt ?? "",
		notes: client.notes ?? "",
	});

	return (
		<form
			className="grid max-w-3xl gap-4 md:grid-cols-2"
			onSubmit={(event) => {
				event.preventDefault();
				onSave({
					name: form.name,
					company: form.company,
					email: form.email,
					phone: form.phone,
					whatsapp: form.whatsapp,
					status: form.status,
					startedAt: form.startedAt || null,
					notes: form.notes,
				});
			}}
		>
			<Field label="Cliente">
				<input
					value={form.name}
					onChange={(event) => setForm({ ...form, name: event.target.value })}
					className="field"
				/>
			</Field>
			<Field label="Proyecto / empresa">
				<input
					value={form.company}
					onChange={(event) => setForm({ ...form, company: event.target.value })}
					className="field"
				/>
			</Field>
			<Field label="Email">
				<input
					value={form.email}
					onChange={(event) => setForm({ ...form, email: event.target.value })}
					className="field"
				/>
			</Field>
			<Field label="Teléfono">
				<input
					value={form.phone}
					onChange={(event) => setForm({ ...form, phone: event.target.value })}
					className="field"
				/>
			</Field>
			<div>
				<p className="text-[11px] tracking-[0.16em] text-copper-soft uppercase">
					WhatsApp
				</p>
				<div className="mt-1 flex items-center gap-2">
					<input
						value={form.whatsapp}
						onChange={(event) =>
							setForm({ ...form, whatsapp: event.target.value })
						}
						className="field"
					/>
					{form.whatsapp.replace(/\D/g, "") ? (
						<a
							href={whatsappHref(form.whatsapp)}
							target="_blank"
							rel="noreferrer"
							className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a]"
							aria-label="Abrir conversación de WhatsApp"
							title="Abrir conversación"
						>
							<WhatsAppIcon />
						</a>
					) : (
						<span
							className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/40 text-white/70"
							aria-hidden="true"
						>
							<WhatsAppIcon />
						</span>
					)}
				</div>
			</div>
			<Field label="Estado">
				<select
					value={form.status}
					onChange={(event) =>
						setForm({ ...form, status: event.target.value as ClientStatus })
					}
					className="field"
				>
					<option value="activo">Activo</option>
					<option value="pausado">En pausa</option>
					<option value="cancelado">Cancelado</option>
				</select>
			</Field>
			<Field label="Activo desde">
				<input
					type="date"
					value={form.startedAt}
					onChange={(event) =>
						setForm({ ...form, startedAt: event.target.value })
					}
					className="field"
				/>
			</Field>
			<div className="md:col-span-2">
				<Field label="Notas">
					<textarea
						value={form.notes}
						onChange={(event) => setForm({ ...form, notes: event.target.value })}
						rows={4}
						className="field"
					/>
				</Field>
			</div>
			<button type="submit" disabled={saving} className="btn-primary">
				{saving ? "Guardando…" : "Guardar contacto"}
			</button>
		</form>
	);
}

function BillingSection({
	client,
	saving,
	onSave,
	onChanged,
}: SaveSectionProps & { onChanged: () => Promise<void> }) {
	const [form, setForm] = useState({
		currency: client.currency,
		monthlyAmount: String(client.monthlyAmount),
		initialPayment: String(client.initialPayment),
		subscriptionType: client.subscriptionType,
		subscriptionDate: client.subscriptionDate,
	});
	const [showRegisterModal, setShowRegisterModal] = useState(false);
	const [showPaymentsModal, setShowPaymentsModal] = useState(false);

	const datesDirty =
		form.subscriptionDate !== client.subscriptionDate ||
		form.subscriptionType !== client.subscriptionType;
	const expirationDate = datesDirty
		? form.subscriptionDate
			? calculateExpirationDate(form.subscriptionDate, form.subscriptionType)
			: ""
		: client.expirationDate;
	const daysRemaining = expirationDate
		? calculateDaysRemaining(expirationDate)
		: 0;

	return (
		<form
			className="grid max-w-3xl gap-4 md:grid-cols-2"
			onSubmit={(event) => {
				event.preventDefault();
				onSave({
					currency: form.currency,
					monthlyAmount: Number(form.monthlyAmount) || 0,
					initialPayment: Number(form.initialPayment) || 0,
					subscriptionType: form.subscriptionType,
					subscriptionDate: form.subscriptionDate,
				});
			}}
		>
			<Field label="Moneda">
				<select
					value={form.currency}
					onChange={(event) =>
						setForm({ ...form, currency: event.target.value as Currency })
					}
					className="field"
				>
					<option value="ARS">ARS</option>
					<option value="USD">USD</option>
				</select>
			</Field>
			<Field label="Tipo">
				<select
					value={form.subscriptionType}
					onChange={(event) =>
						setForm({
							...form,
							subscriptionType: event.target.value as SubscriptionType,
						})
					}
					className="field"
				>
					<option value="mensual">Mensual</option>
					<option value="anual">Anual</option>
				</select>
			</Field>
			<Field label="Honorario mensual">
				<input
					type="number"
					min="0"
					value={form.monthlyAmount}
					onChange={(event) =>
						setForm({ ...form, monthlyAmount: event.target.value })
					}
					className="field"
				/>
			</Field>
			<Field label="Pago inicial">
				<input
					type="number"
					min="0"
					value={form.initialPayment}
					onChange={(event) =>
						setForm({ ...form, initialPayment: event.target.value })
					}
					className="field"
				/>
			</Field>
			<Field label="Inicio de cobro">
				<input
					type="date"
					value={form.subscriptionDate}
					onChange={(event) =>
						setForm({ ...form, subscriptionDate: event.target.value })
					}
					className="field"
				/>
			</Field>
			<div>
				<p className="text-[11px] tracking-[0.16em] text-copper-soft uppercase">
					Vencimiento
				</p>
				<p className="mt-1 border border-white/10 bg-ink-soft px-3 py-2 text-sm text-paper">
					{expirationDate ? (
						<>
							{formatDate(expirationDate)}
							<span className="ml-2 text-ink-muted">
								{daysRemaining === 0
									? "hoy"
									: daysRemaining === 1
										? "1 día"
										: `${daysRemaining} días`}
							</span>
						</>
					) : (
						"—"
					)}
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-3 md:col-span-2">
				<button
					type="button"
					className="btn-primary"
					onClick={() => setShowRegisterModal(true)}
				>
					Registrar pago
				</button>
				<button
					type="button"
					className="border border-white/15 px-4 py-2 text-sm text-paper hover:border-copper/50"
					onClick={() => setShowPaymentsModal(true)}
				>
					Ver pagos
					{client.payments.length > 0 ? ` (${client.payments.length})` : ""}
				</button>
			</div>
			<button type="submit" disabled={saving} className="btn-primary">
				{saving ? "Guardando…" : "Guardar cobro"}
			</button>
			{showRegisterModal ? (
				<RegisterPaymentModal
					client={client}
					onClose={() => setShowRegisterModal(false)}
					onRegistered={onChanged}
				/>
			) : null}
			{showPaymentsModal ? (
				<PaymentsModal
					client={client}
					onClose={() => setShowPaymentsModal(false)}
				/>
			) : null}
		</form>
	);
}

function RegisterPaymentModal({
	client,
	onClose,
	onRegistered,
}: {
	client: ClientWorkspace;
	onClose: () => void;
	onRegistered: () => Promise<void>;
}) {
	const suggested =
		client.subscriptionType === "anual"
			? client.monthlyAmount * 12
			: client.monthlyAmount;
	const [amount, setAmount] = useState(String(suggested || ""));
	const [paidAt, setPaidAt] = useState(todayDateOnly());
	const [notes, setNotes] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const nextExpiration = addSubscriptionPeriod(
		client.expirationDate,
		client.subscriptionType,
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			onClick={saving ? undefined : onClose}
			role="dialog"
			aria-modal="true"
			aria-label="Registrar pago"
		>
			<form
				className="w-full max-w-md border border-white/10 bg-ink-soft shadow-xl"
				onClick={(e) => e.stopPropagation()}
				onSubmit={async (event) => {
					event.preventDefault();
					setSaving(true);
					setError("");
					try {
						await createPayment(client.id, {
							amount: Number(amount) || 0,
							paidAt,
							notes,
						});
						await onRegistered();
						onClose();
					} catch (err) {
						setError((err as Error).message);
						setSaving(false);
					}
				}}
			>
				<div className="border-b border-white/10 px-4 py-3">
					<p className="text-sm font-medium text-paper">Registrar pago</p>
					<p className="mt-0.5 text-xs text-ink-muted">
						Vence {formatDate(client.expirationDate)} →{" "}
						{formatDate(nextExpiration)}
					</p>
				</div>
				<div className="grid gap-3 px-4 py-4">
					<Field label="Monto">
						<input
							type="number"
							min="0"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
							className="field"
						/>
					</Field>
					<Field label="Fecha de pago">
						<input
							type="date"
							value={paidAt}
							onChange={(event) => setPaidAt(event.target.value)}
							className="field"
						/>
					</Field>
					<Field label="Notas">
						<textarea
							rows={2}
							value={notes}
							onChange={(event) => setNotes(event.target.value)}
							className="field"
						/>
					</Field>
					{error ? <p className="text-sm text-danger">{error}</p> : null}
					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="border border-white/15 px-4 py-2 text-xs text-paper hover:border-copper/50"
						>
							Cancelar
						</button>
						<button type="submit" disabled={saving} className="btn-primary">
							{saving ? "Registrando…" : "Registrar"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

function PaymentsModal({
	client,
	onClose,
}: {
	client: ClientWorkspace;
	onClose: () => void;
}) {
	const payments = [...client.payments].sort((a, b) =>
		a.paidAt < b.paidAt ? 1 : -1,
	);
	const total = payments.reduce((sum, payment) => sum + payment.amount, 0);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label="Pagos registrados"
		>
			<div
				className="flex max-h-[85vh] w-full max-w-lg flex-col border border-white/10 bg-ink-soft shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
					<div>
						<p className="text-sm font-medium text-paper">Pagos</p>
						<p className="text-xs text-ink-muted">
							{payments.length === 0
								? "Sin pagos aún"
								: `${payments.length} ${payments.length === 1 ? "pago" : "pagos"} · ${formatMoney(total, client.currency)}`}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex size-8 items-center justify-center border border-white/15 text-paper/70 hover:text-paper"
						aria-label="Cerrar"
					>
						✕
					</button>
				</div>
				<div className="min-h-0 flex-1 overflow-auto">
					{payments.length === 0 ? (
						<p className="px-4 py-10 text-center text-sm text-paper/60">
							Todavía no hay pagos registrados.
						</p>
					) : (
						<ul>
							{payments.map((payment, index) => (
								<li
									key={payment.id}
									className={`px-4 py-3 ${index > 0 ? "border-t border-white/10" : ""}`}
								>
									<div className="flex items-baseline justify-between gap-3">
										<p className="text-sm text-paper">
											{formatMoney(payment.amount, client.currency)}
										</p>
										<p className="text-xs text-ink-muted">
											{formatDate(payment.paidAt)}
										</p>
									</div>
									{payment.notes ? (
										<p className="mt-1 text-xs text-paper/55">
											{payment.notes}
										</p>
									) : null}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}

interface NestedProps {
	client: ClientWorkspace;
	onChanged: () => Promise<void>;
}

function ResourcesSection({ client, onChanged }: NestedProps) {
	const [kind, setKind] = useState<ResourceKind>("website");
	const [label, setLabel] = useState("");
	const [url, setUrl] = useState("");
	const [notes, setNotes] = useState("");

	return (
		<div className="max-w-4xl">
			<form
				className="mb-6 grid gap-3 md:grid-cols-4"
				onSubmit={async (event) => {
					event.preventDefault();
					if (!label.trim()) return;
					await createResource(client.id, {
						kind,
						label,
						url: url || null,
						notes: notes || null,
					});
					setLabel("");
					setUrl("");
					setNotes("");
					await onChanged();
				}}
			>
				<select
					value={kind}
					onChange={(event) => setKind(event.target.value as ResourceKind)}
					className="field"
				>
					{resourceKinds.map((item) => (
						<option key={item} value={item}>
							{resourceLabel[item]}
						</option>
					))}
				</select>
				<input
					value={label}
					onChange={(event) => setLabel(event.target.value)}
					placeholder="Nombre del producto"
					className="field"
				/>
				<input
					value={url}
					onChange={(event) => setUrl(event.target.value)}
					placeholder="URL"
					className="field"
				/>
				<button type="submit" className="btn-primary">
					Agregar
				</button>
				<textarea
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
					placeholder="Notas de acceso"
					className="field md:col-span-4"
					rows={2}
				/>
			</form>
			<ul className="grid gap-3 md:grid-cols-2">
				{client.resources.map((resource) => (
					<li
						key={resource.id}
						className="border border-white/10 bg-ink-soft/50 p-4"
					>
						<p className="text-[10px] tracking-widest text-copper-soft uppercase">
							{resourceLabel[resource.kind]}
						</p>
						<p className="mt-1 text-paper">{resource.label}</p>
						{resource.url ? (
							<a
								href={resource.url}
								target="_blank"
								rel="noreferrer"
								className="mt-1 block truncate text-sm text-copper-soft hover:text-paper"
							>
								{resource.url}
							</a>
						) : null}
						{resource.notes ? (
							<p className="mt-2 text-xs text-ink-muted">{resource.notes}</p>
						) : null}
						<button
							type="button"
							className="mt-3 text-xs text-danger"
							onClick={async () => {
								await deleteResource(client.id, resource.id);
								await onChanged();
							}}
						>
							Quitar
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

function SocialSection({ client, onChanged }: NestedProps) {
	const [platform, setPlatform] = useState<SocialPlatform>("instagram");
	const [url, setUrl] = useState("");
	const [handle, setHandle] = useState("");

	return (
		<div className="max-w-3xl">
			<form
				className="mb-6 grid gap-3 md:grid-cols-4"
				onSubmit={async (event) => {
					event.preventDefault();
					if (!url.trim()) return;
					await createSocial(client.id, {
						platform,
						url,
						handle: handle || null,
					});
					setUrl("");
					setHandle("");
					await onChanged();
				}}
			>
				<select
					value={platform}
					onChange={(event) =>
						setPlatform(event.target.value as SocialPlatform)
					}
					className="field"
				>
					{socialPlatforms.map((item) => (
						<option key={item} value={item}>
							{socialLabel[item]}
						</option>
					))}
				</select>
				<input
					value={handle}
					onChange={(event) => setHandle(event.target.value)}
					placeholder="@handle"
					className="field"
				/>
				<input
					value={url}
					onChange={(event) => setUrl(event.target.value)}
					placeholder="URL"
					className="field"
				/>
				<button type="submit" className="btn-primary">
					Agregar
				</button>
			</form>
			<ul className="space-y-2">
				{client.socialLinks.map((link) => (
					<li
						key={link.id}
						className="flex flex-col gap-2 border border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
					>
						<div className="min-w-0">
							<p className="text-xs tracking-widest text-copper-soft uppercase">
								{socialLabel[link.platform]}
							</p>
							<a
								href={link.url}
								target="_blank"
								rel="noreferrer"
								className="block truncate text-sm text-paper hover:text-copper-soft"
							>
								{link.handle ?? link.url}
							</a>
						</div>
						<button
							type="button"
							className="text-xs text-danger"
							onClick={async () => {
								await deleteSocial(client.id, link.id);
								await onChanged();
							}}
						>
							Quitar
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

function DocumentsSection({ client, onChanged }: NestedProps) {
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState<DocumentCategory>("documentation");
	const [notes, setNotes] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [previewDoc, setPreviewDoc] = useState<
		(typeof client.documents)[number] | null
	>(null);

	return (
		<div className="max-w-3xl">
			<form
				className="mb-6 grid gap-3 md:grid-cols-2"
				onSubmit={async (event) => {
					event.preventDefault();
					if (!title.trim() || !file) return;
					const form = new FormData();
					form.set("title", title);
					form.set("category", category);
					form.set("notes", notes);
					form.set("file", file);
					await createDocument(client.id, form);
					setTitle("");
					setNotes("");
					setFile(null);
					await onChanged();
				}}
			>
				<input
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					placeholder="Título"
					className="field"
				/>
				<select
					value={category}
					onChange={(event) =>
						setCategory(event.target.value as DocumentCategory)
					}
					className="field"
				>
					<option value="documentation">Documentación</option>
					<option value="contract">Contrato</option>
					<option value="other">Otro</option>
				</select>
				<input
					type="file"
					onChange={(event) => setFile(event.target.files?.[0] ?? null)}
					className="field md:col-span-2"
				/>
				<textarea
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
					placeholder="Notas"
					className="field md:col-span-2"
					rows={2}
				/>
				<button type="submit" className="btn-primary">
					Subir documento
				</button>
			</form>
			<ul className="space-y-2">
				{client.documents.map((doc) => (
					<li
						key={doc.id}
						className="flex flex-col gap-2 border border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
					>
						<div className="min-w-0">
							<p className="truncate text-paper">{doc.title}</p>
							<p className="truncate text-xs text-ink-muted">
								{documentLabel[doc.category]} · {doc.fileName}
							</p>
						</div>
						<div className="flex items-center gap-3 text-xs">
							<button
								type="button"
								onClick={() => setPreviewDoc(doc)}
								className="inline-flex items-center gap-1 text-paper hover:text-copper-soft"
							>
								<EyeIcon /> Ver
							</button>
							<a
								href={`/api/clients/${client.id}/documents/${doc.id}?download=1`}
								className="text-copper-soft hover:text-paper"
							>
								Bajar
							</a>
							<button
								type="button"
								className="text-danger hover:underline"
								onClick={async () => {
									if (confirm(`¿Borrar «${doc.title}»?`)) {
										await deleteDocument(client.id, doc.id);
										await onChanged();
									}
								}}
							>
								Borrar
							</button>
						</div>
					</li>
				))}
			</ul>
			{previewDoc ? (
				<FilePreviewModal
					title={previewDoc.title}
					fileName={previewDoc.fileName}
					mimeType={previewDoc.mimeType}
					url={`/api/clients/${client.id}/documents/${previewDoc.id}`}
					downloadUrl={`/api/clients/${client.id}/documents/${previewDoc.id}?download=1`}
					onClose={() => setPreviewDoc(null)}
				/>
			) : null}
		</div>
	);
}

function ProposalsSection({ client, onChanged }: NestedProps) {
	const [title, setTitle] = useState("");
	const [amount, setAmount] = useState("");
	const [status, setStatus] = useState<ProposalStatus>("draft");
	const [sentAt, setSentAt] = useState("");
	const [notes, setNotes] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<{
		title: string;
		fileName: string;
		mimeType: string;
		url: string;
		downloadUrl: string;
	} | null>(null);

	return (
		<div className="max-w-3xl">
			<form
				className="mb-6 grid gap-3 md:grid-cols-2"
				onSubmit={async (event) => {
					event.preventDefault();
					if (!title.trim()) return;
					const form = new FormData();
					form.set("title", title);
					if (amount) form.set("amount", amount);
					form.set("status", status);
					if (sentAt) form.set("sentAt", sentAt);
					form.set("notes", notes);
					if (file) form.set("file", file);
					await createProposal(client.id, form);
					setTitle("");
					setAmount("");
					setNotes("");
					setFile(null);
					await onChanged();
				}}
			>
				<input
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					placeholder="Título de la propuesta"
					className="field md:col-span-2"
				/>
				<input
					type="number"
					min="0"
					value={amount}
					onChange={(event) => setAmount(event.target.value)}
					placeholder="Monto"
					className="field"
				/>
				<select
					value={status}
					onChange={(event) =>
						setStatus(event.target.value as ProposalStatus)
					}
					className="field"
				>
					<option value="draft">Borrador</option>
					<option value="sent">Enviada</option>
					<option value="accepted">Aceptada</option>
					<option value="rejected">Rechazada</option>
				</select>
				<input
					type="date"
					value={sentAt}
					onChange={(event) => setSentAt(event.target.value)}
					className="field"
				/>
				<input
					type="file"
					onChange={(event) => setFile(event.target.files?.[0] ?? null)}
					className="field"
				/>
				<textarea
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
					placeholder="Notas"
					className="field md:col-span-2"
					rows={2}
				/>
				<button type="submit" className="btn-primary">
					Registrar propuesta
				</button>
			</form>
			<ul className="space-y-2">
				{client.proposals.map((proposal) => (
					<li key={proposal.id} className="border border-white/10 px-4 py-3">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p className="wrap-break-word text-paper">{proposal.title}</p>
								<p className="text-xs text-ink-muted">
									{proposalLabel[proposal.status]}
									{proposal.amount != null
										? ` · ${formatMoney(proposal.amount, client.currency)}`
										: ""}
									{proposal.sentAt ? ` · ${formatDate(proposal.sentAt)}` : ""}
								</p>
							</div>
							<div className="flex items-center gap-3 text-xs">
								{proposal.fileName ? (
									<>
										<button
											type="button"
											onClick={() =>
												setPreview({
													title: proposal.title,
													fileName: proposal.fileName!,
													mimeType: proposal.mimeType ?? "application/octet-stream",
													url: `/api/clients/${client.id}/proposals/${proposal.id}`,
													downloadUrl: `/api/clients/${client.id}/proposals/${proposal.id}?download=1`,
												})
											}
											className="inline-flex items-center gap-1 text-paper hover:text-copper-soft"
										>
											<EyeIcon /> Ver
										</button>
										<a
											href={`/api/clients/${client.id}/proposals/${proposal.id}?download=1`}
											className="text-copper-soft hover:text-paper"
										>
											Bajar
										</a>
									</>
								) : null}
								<button
									type="button"
									className="text-danger hover:underline"
									onClick={async () => {
										if (confirm(`¿Borrar «${proposal.title}»?`)) {
											await deleteProposal(client.id, proposal.id);
											await onChanged();
										}
									}}
								>
									Borrar
								</button>
							</div>
						</div>
					</li>
				))}
			</ul>
			{preview ? (
				<FilePreviewModal
					title={preview.title}
					fileName={preview.fileName}
					mimeType={preview.mimeType}
					url={preview.url}
					downloadUrl={preview.downloadUrl}
					onClose={() => setPreview(null)}
				/>
			) : null}
		</div>
	);
}

interface FieldProps {
	label: string;
	children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
	return (
		<label className="block text-[11px] tracking-[0.16em] text-copper-soft uppercase">
			{label}
			<div className="mt-1">{children}</div>
		</label>
	);
}

function FilePreviewModal({
	title,
	fileName,
	mimeType,
	url,
	downloadUrl,
	onClose,
}: {
	title: string;
	fileName: string;
	mimeType: string;
	url: string;
	downloadUrl: string;
	onClose: () => void;
}) {
	const isImage = mimeType.startsWith("image/");
	const isPdf = mimeType === "application/pdf";

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label={`Vista previa de ${fileName}`}
		>
			<div
				className="flex max-h-[90vh] w-full max-w-5xl flex-col border border-white/10 bg-ink-soft shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
					<div className="min-w-0">
						<p className="truncate text-sm font-medium text-paper">{title}</p>
						<p className="truncate text-xs text-ink-muted">{fileName} · {mimeType}</p>
					</div>
					<div className="flex shrink-0 items-center gap-2">
						<a
							href={url}
							target="_blank"
							rel="noreferrer"
							className="hidden border border-white/15 px-3 py-1.5 text-xs text-paper hover:border-copper/50 sm:inline-flex"
						>
							Abrir en pestaña
						</a>
						<a
							href={downloadUrl}
							className="border border-copper bg-copper px-3 py-1.5 text-xs font-medium text-ink hover:bg-copper-soft"
						>
							Bajar
						</a>
						<button
							type="button"
							onClick={onClose}
							className="flex size-8 items-center justify-center border border-white/15 text-paper/70 hover:text-paper"
							aria-label="Cerrar"
						>
							✕
						</button>
					</div>
				</div>
				<div className="min-h-0 flex-1 overflow-auto bg-ink p-2 sm:p-4">
					{isImage ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={url} alt={fileName} className="mx-auto max-h-[75vh] max-w-full object-contain" />
					) : isPdf ? (
						<iframe src={url} title={fileName} className="h-[75vh] w-full border-0 bg-white" />
					) : (
						<div className="flex h-[50vh] flex-col items-center justify-center gap-4 py-10 text-center">
							<p className="text-sm text-paper/70">
								Vista previa no disponible para este tipo de archivo.
							</p>
							<p className="text-xs text-ink-muted">{mimeType}</p>
							<div className="flex gap-2">
								<a href={url} target="_blank" rel="noreferrer" className="btn-primary">
									Abrir archivo
								</a>
								<a href={downloadUrl} className="border border-white/15 px-4 py-2 text-xs text-paper">
									Bajar
								</a>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function EyeIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
			<path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	);
}

function WhatsAppIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className="h-[22px] w-[22px]"
			fill="currentColor"
		>
			<path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zm-7.01 15.24h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74 1.64.71 2.08.77 2.83.65.43-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
		</svg>
	);
}
