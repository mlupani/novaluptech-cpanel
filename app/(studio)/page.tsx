import { getClients, getInboxNotes } from "@/lib/queries";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
	const [clients, notes] = await Promise.all([getClients(), getInboxNotes()]);
	return <DashboardView clients={clients} notes={notes} />;
}
