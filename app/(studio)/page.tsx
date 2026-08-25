import {
	getClients,
	getInboxNotes,
	getTodoTasksOverview,
} from "@/lib/queries";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
	const [clients, notes, todoOverview] = await Promise.all([
		getClients(),
		getInboxNotes(),
		getTodoTasksOverview(),
	]);
	return (
		<DashboardView clients={clients} notes={notes} todoOverview={todoOverview} />
	);
}
