import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const fraunces = Fraunces({
	subsets: ["latin"],
	variable: "--font-fraunces",
	display: "swap",
});

const ibmPlex = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-ibm",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Novalup — Estudio de clientes",
	description:
		"Dossier operativo de clientes, cobros, productos y propuestas para Novalup.",
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.svg", type: "image/svg+xml" },
			{ url: "/icon-32.png", type: "image/png", sizes: "32x32" },
			{ url: "/icon-192.png", type: "image/png", sizes: "192x192" },
			{ url: "/icon-512.png", type: "image/png", sizes: "512x512" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
	themeColor: "#12110e",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body
				className={`${fraunces.variable} ${ibmPlex.variable} font-sans antialiased`}
			>
				<script
					dangerouslySetInnerHTML={{
						__html: `try{var t=localStorage.getItem("novalup-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
					}}
				/>
				<QueryProvider>
					<AppShell>{children}</AppShell>
				</QueryProvider>
			</body>
		</html>
	);
}
