import { getClients } from "@/lib/queries";
import { ClientLedger } from "@/components/clients/ClientLedger";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
	const clients = await getClients();
	return <ClientLedger initialClients={clients} />;
}
