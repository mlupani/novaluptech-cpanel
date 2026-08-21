import { notFound } from "next/navigation";
import { getClients, getClientWorkspace } from "@/lib/queries";
import { ClientWorkspaceView } from "@/components/workspace/ClientWorkspaceView";

export const dynamic = "force-dynamic";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function ClientWorkspacePage({ params }: PageProps) {
	const { id } = await params;
	const [client, clients] = await Promise.all([
		getClientWorkspace(id),
		getClients(),
	]);

	if (!client) notFound();

	return <ClientWorkspaceView initialClient={client} clients={clients} />;
}
