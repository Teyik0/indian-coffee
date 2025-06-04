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
	title: "Entrées | Indian Coffee",
	description:
		"Toutes les entrées à la carte, que ce soit à emporter ou sur place.",
	openGraph: {
		title: "Entrées | Indian Coffee",
		description:
			"Toutes les entrées à la carte, que ce soit à emporter ou sur place.",
		siteName: "Indian Coffee",
		locale: "fr",
		url: "https://indiancoffee.fr/",
	},
};

const page = () => {
	return (
		<section className="w-full items-center justify-center text-white pb-24">
			<Image
				src="/asset-entry.webp"
				width={400}
				height={150}
				alt="logo"
				className="hidden absolute sm:flex md:hidden top-0 right-0 z-0"
			/>
			<Image
				src="/asset-entry.webp"
				width={500}
				height={150}
				alt="logo"
				className="hidden absolute md:flex xl:hidden top-0 right-0 z-0"
			/>
			<Image
				src="/asset-entry.webp"
				width={700}
				height={150}
				alt="logo"
				className="absolute hidden top-0 right-0 xl:flex"
			/>

			<div className="pl-4 pr-4 pt-24 sm:pt-48">
				<h1 className="uppercase text-[#e8b755] text-2xl font-bold tracking-wider mb-2">
					entrées
				</h1>
				<Plat
					title="SAMOSSA VIANDE - 2P"
					details="CHAUSSON DE VIANDE POULET OU BOEUF, PETITS POIS ET POMMES DE TERRE"
					price="4,50€"
				/>
				<Plat
					title="SAMOSSA LÉGUMES - 2P"
					details="CHAUSSON DE LÉGUMES ET POMME DE TERRE"
					price="4,50€"
				/>
				<Plat
					title="ROLLS VIANDE - 2P"
					details="ROULEAUX PANÉS DE VIANDE  ET POMME DE TERRE"
					price="4,50€"
				/>

				<div className="mb-2">
					<Plat
						title="BADJI"
						details="BEIGNETS À LA FARINE DE POIS CHICHE"
						price=""
					/>
					<SousPlat
						title="BADJI AUX AUBERGINES - 3P"
						price="4,00€"
						details=""
					/>
					<SousPlat
						title="BADJI AUX POMMES DE TERRE"
						price="4,00€"
						details=""
					/>
					<SousPlat title="BADJI AUX OIGNONS - 3P" price="4,00€" details="" />
					<SousPlat title="BADJI AUX CREVETTES - 3P" price="7,50€" details="" />
					<SousPlat
						title="ASSORTISSEMENTS POUR 2 PERSONNES"
						price="9,00€"
						details=""
					/>
				</div>

				<div className="mb-2">
					<Plat title="VADAI" details="BEIGNET AUX LENTILLES" price="" />
					<SousPlat title="VADA - 2P" price="4,00€" details="" />
					<SousPlat title="VADA AUX EPINARDS - 1P" price="4,00€" details="" />
					<SousPlat title="SAMBAR VADAI - 2P" price="4,50€" details="" />
				</div>

				<div className="flex flex-col sm:flex-row xl:flex-col">
					<div className="mb-2 sm:w-1/2">
						<Plat
							title="GRILLADES"
							details="AU FOUR TANDOOR"
							price=""
							fullProps
						/>
						<SousPlat
							title="MIXTE TANDOORI (POUR 2 PERSONNES)"
							details="PIÈCE DE POULET TIKKA, TANDOORI ET AGNEAU TIKKA"
							price="18,00€"
							fullProps
						/>
						<SousPlat
							title="POULET TANDORI"
							details="CUISSE DE POULET MARINÉE"
							price="6,50€"
							fullProps
						/>
						<SousPlat
							title="GAMBAS TANDOORI - 5P"
							details="GAMBAS MARINÉS"
							price="15,00€"
							fullProps
						/>
						<SousPlat
							title="POULET TIKKA"
							details="BLANC DE POULET MARINÉ"
							price="9,00€"
							fullProps
						/>
						<SousPlat
							title="AGNEAU TIKKA"
							details="AGNEAU MARINÉ"
							price="9,90€"
							fullProps
						/>
						<SousPlat
							title="SAUMON TIKKA"
							details="SAUMON MARINÉ"
							price="9,90€"
							fullProps
						/>
						<SousPlat
							title="PANEER TIKKA"
							details="BROCHETTES DE FROMAGE INDIEN AVEC DES LÉGUMES"
							price="7,50€"
							fullProps
						/>
					</div>

					<div className="mb-2 sm:w-1/2">
						<Plat
							title="LES SALADES"
							details="SALADE INDIENNE FAIT MAISON"
							price=""
							fullProps
						/>
						<SousPlat
							title="SALADE POULET TIKKA"
							details="SALADE, OIGNONS, TOMATES, MAÏS OLIVES, POULET TIKKA  AVEC NAAN NATURE"
							price="13,00€"
							fullProps
						/>
						<SousPlat
							title="SALADE SAUMON TIKKA"
							details="SALADE, OIGNONS, TOMATES, MAÏS, OLIVES, SAUMON TIKKA  AVEC NAAN NATURE"
							price="15,00€"
							fullProps
						/>
						<SousPlat
							title="SALADE VÉGÉTARIENNE"
							details="SALADE, CONCOMBRES, MAÎS, OLIVES, POMMES DE TERRE AVEC NAAN NATURE"
							price="12,00€"
							fullProps
						/>
						<SousPlat
							title="RAITA"
							details="CAROTTES, CONCOMBRES, TOMATES, YAOURT, OIGNONS"
							price="5,00€"
							fullProps
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default page;
