import { create } from "zustand";
import type { ClientStatus, SubscriptionType } from "@/types/client";

export type WorkspaceSection =
	| "contacto"
	| "cobro"
	| "productos"
	| "redes"
	| "documentos"
	| "propuestas";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "novalup-theme";

interface ListFilters {
	search: string;
	status: ClientStatus | "all";
	subscriptionType: SubscriptionType | "all";
}

interface UiState {
	sidebarOpen: boolean;
	workspaceSection: WorkspaceSection;
	listFilters: ListFilters;
	theme: Theme;
	setSidebarOpen: (open: boolean) => void;
	toggleSidebar: () => void;
	setWorkspaceSection: (section: WorkspaceSection) => void;
	setListFilters: (filters: Partial<ListFilters>) => void;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	hydrateTheme: () => void;
}

function applyTheme(theme: Theme) {
	document.documentElement.dataset.theme = theme;
	localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export const useUiStore = create<UiState>()((set) => ({
	sidebarOpen: true,
	workspaceSection: "contacto",
	listFilters: {
		search: "",
		status: "all",
		subscriptionType: "all",
	},
	theme: "dark",
	setSidebarOpen: (open) => set({ sidebarOpen: open }),
	toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
	setWorkspaceSection: (workspaceSection) => set({ workspaceSection }),
	setListFilters: (filters) =>
		set((state) => ({
			listFilters: { ...state.listFilters, ...filters },
		})),
	setTheme: (theme) => {
		applyTheme(theme);
		set({ theme });
	},
	toggleTheme: () =>
		set((state) => {
			const theme: Theme = state.theme === "dark" ? "light" : "dark";
			applyTheme(theme);
			return { theme };
		}),
	hydrateTheme: () => {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		const theme: Theme = stored === "light" ? "light" : "dark";
		applyTheme(theme);
		set({ theme });
	},
}));
