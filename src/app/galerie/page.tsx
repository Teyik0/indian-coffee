import { Carroussel } from "@/components/Carroussel";
import type { Metadata } from "next";

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
	title: "Galerie | Toutes les photos du restaurant Indian Coffee",
	description:
		"Explorez la galerie du restaurant Indian Coffee et plongez dans un voyage visuel captivant à travers nos délicieux plats. Découvrez nos spécialités culinaires, notre décoration authentique et notre passion pour offrir une expérience gastronomique unique.",
	openGraph: {
		title: "Galerie | Toutes les photos du restaurant Indian Coffee",
		description:
			"Explorez la galerie du restaurant Indian Coffee et plongez dans un voyage visuel captivant à travers nos délicieux plats. Découvrez nos spécialités culinaires, notre décoration authentique et notre passion pour offrir une expérience gastronomique unique.",
		siteName: "Indian Coffee",
		locale: "fr",
		url: "https://indiancoffee.fr/",
	},
};

const photoEvent = [
	{ img: "/gallerie/evenement/1.webp" },
	{ img: "/gallerie/evenement/2.webp" },
	{ img: "/gallerie/evenement/3.webp" },
	{ img: "/gallerie/evenement/4.webp" },
	{ img: "/gallerie/evenement/5.webp" },
	{ img: "/gallerie/evenement/6.webp" },
	{ img: "/gallerie/evenement/7.webp" },
];

const photoDessert = [
	{ img: "/gallerie/dessert/1.webp" },
	{ img: "/gallerie/dessert/2.webp" },
	{ img: "/gallerie/dessert/3.webp" },
	{ img: "/gallerie/dessert/4.webp" },
	{ img: "/gallerie/dessert/5.webp" },
	{ img: "/gallerie/dessert/6.webp" },
	{ img: "/gallerie/dessert/7.webp" },
	{ img: "/gallerie/dessert/8.webp" },
];

const photoPlat = [
	{ img: "/gallerie/plats/1.webp" },
	{ img: "/gallerie/plats/2.webp" },
	{ img: "/gallerie/plats/3.webp" },
	{ img: "/gallerie/plats/4.webp" },
	{ img: "/gallerie/plats/5.webp" },
	{ img: "/gallerie/plats/6.webp" },
	{ img: "/gallerie/plats/7.webp" },
	{ img: "/gallerie/plats/8.webp" },
	{ img: "/gallerie/plats/9.webp" },
	{ img: "/gallerie/plats/10.webp" },
];

const photoSpe = [
	{ img: "/gallerie/specialite/1.webp" },
	{ img: "/gallerie/specialite/2.webp" },
	{ img: "/gallerie/specialite/3.webp" },
];

const photoEntry = [
	{ img: "/gallerie/entree/1.webp" },
	{ img: "/gallerie/entree/2.webp" },
	{ img: "/gallerie/entree/3.webp" },
	{ img: "/gallerie/entree/4.webp" },
	{ img: "/gallerie/entree/5.webp" },
	{ img: "/gallerie/entree/6.webp" },
	{ img: "/gallerie/entree/7.webp" },
	{ img: "/gallerie/entree/8.webp" },
	{ img: "/gallerie/entree/9.webp" },
	{ img: "/gallerie/entree/10.webp" },
	{ img: "/gallerie/entree/11.webp" },
];

const photoVege = [{ img: "/gallerie/vege/1.webp" }];

const page = () => {
	return (
		<div>
			<section className="bg-image5 min-h-[540px] flex justify-center items-center">
				<h1 className="font-caveat text-7xl text-white font-bold">Galerie</h1>
			</section>

			<Carroussel title="Entrées" photo={photoEntry} />
			<Carroussel title="Plats" photo={photoPlat} />
			<Carroussel title="Spécialités" photo={photoSpe} />
			<Carroussel title="Desserts" photo={photoDessert} />
			<Carroussel title="évènements" photo={photoEvent} />

			<section className="sm:px-8 px-4 xl:px-24x">
				<h5 className="text-lg italic text-gray-200 text-left pb-12">
					*Photos des plats non contractuelles
				</h5>
			</section>
		</div>
	);
};

export default page;
