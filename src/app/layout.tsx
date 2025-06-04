import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	alternates: {
		canonical: "/",
		languages: {
			"fr-FR": "/fr-FR",
		},
	},
	icons: {
		icon: "/favicon.webp",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="fr">
			<body>
				<Navbar />
				{children}
				<Footer />
			</body>
		</html>
	);
}
