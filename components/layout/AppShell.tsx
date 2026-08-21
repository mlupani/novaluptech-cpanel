import { AppHeader } from "@/components/layout/AppHeader";

interface AppShellProps {
	children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	return (
		<div className="relative z-10 min-h-screen">
			<AppHeader />
			{children}
		</div>
	);
}
