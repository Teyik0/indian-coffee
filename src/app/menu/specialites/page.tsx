import { Plat } from "@/components/Plat";
import { SousPlat } from "@/components/SousPlat";
import type { Metadata } from "next";
import Image from "next/image";

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
	title: "Spécialités | Indian Coffee",
	description:
		"Toutes nos spécialités à la carte, que ce soit à emporter ou sur place.",
	openGraph: {
		title: "Spécialités | Indian Coffee",
		description:
			"Toutes nos spécialités à la carte, que ce soit à emporter ou sur place.",
		siteName: "Indian Coffee",
		locale: "fr",
		url: "https://indiancoffee.fr/",
	},
};

const page = () => {
	return (
		<section className="w-full items-center justify-center text-white pb-24">
			<Image
				src="/asset-specialities.webp"
				width={400}
				height={150}
				alt="logo"
				className="hidden absolute sm:flex md:hidden top-0 right-0 z-0"
			/>
			<Image
				src="/asset-specialities.webp"
				width={500}
				height={150}
				alt="logo"
				className="hidden absolute md:flex xl:hidden top-0 right-0 z-0"
			/>
			<Image
				src="/asset-specialities2.webp"
				width={700}
				height={150}
				alt="logo"
				className="absolute hidden top-0 right-0 xl:flex"
			/>

			<div className="pl-4 pr-4 pt-24 sm:pt-48">
				<h1 className="uppercase text-[#e8b755] text-2xl font-bold tracking-wider mb-2">
					spécialités
				</h1>

				<Plat
					title="BUTTER CHICKEN"
					details="POULET AU BEURRE ET RIZ BASMATI"
					price="14,90€"
				/>
				<Plat
					title="CURRY D'AGNEAU AUX ÉPINARDS"
					details="CURRY D'AGNEAU ET RIZ BASMATI"
					price="15,90€"
				/>
				<Plat
					title="FRIED RICE POULET"
					details="RIZ SAUTÉ AVEC POULET ET LÉGUMES"
					price="14,50€"
				/>
				<Plat
					title="FRIED RICE ROYAL"
					details="RIZ SAUTÉ AVEC CREVETTES ET GAMBAS ÉPICÉ"
					price="16,90€"
				/>
				<Plat title="CHICKEN 65" details="POULET FRIT ET épicé" price="9,00€" />
				<Plat
					title="CHILI CHICKEN"
					details="POULET FRIT POIVRONS ÉPICÉ, SAUCE CHILI"
					price="11.90"
				/>
				<Plat
					title="CHILI CREVETTES"
					details="CREVETTES POIVRONS ÉPICÉES, SAUCE CHILI"
					price="14,90€"
				/>
				<Plat
					title="BEEF DEVAL"
					details="BOEUF SAUTÉ AUX ÉPICES"
					price="16,00€"
				/>
				<Plat
					title="DORADE ROYALE ENTIÈRE"
					details="POISSON MARINÉ AUX ÉPICES, GRILLÉ AU FOUR TANDOOR SERVI AVEC DU RIZ"
					price="21,90€"
				/>
				<div className="mb-2">
					<Plat title="GARNITURES ET ACCOMPAGNEMENTS" details="" price="" />
					<SousPlat title="NAAN AU FROMAGE" details="" price="4,00€" />
					<SousPlat title="NAAN NATURE" details="" price="3,00€" />
					<SousPlat title="NAAN À L’AIL" details="" price="3,50€" />
					<SousPlat title="KEEMA NAAN" details="" price="5,50€" />
					<SousPlat title="BAROTTHA" details="" price="2,00€" />
					<SousPlat title="CHAPATTY" details="" price="2,00€" />
					<SousPlat title="RIZ BASMATI NATURE" details="" price="3,50€" />
					<SousPlat title="RIZ SUPREME" details="" price="4,50€" />
					<SousPlat title="RIZ COCO" details="" price="5,50€" />
					<SousPlat title="FRITES " details="" price="4,50€" />
				</div>
			</div>
		</section>
	);
};

export default page;
