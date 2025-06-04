import { ContactForm } from "@/components/ContactForm";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { ImPhone } from "react-icons/im";
import { IoLocationSharp } from "react-icons/io5";
import { SiMinutemailer } from "react-icons/si";

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
	title: "Contact | Indian Coffee",
	description:
		"Contactez-nous pour toute demande, question ou commentaire. L'équipe d'Indian Coffee est là pour vous aider et vous offrir une expérience client exceptionnelle. Remplissez notre formulaire de contact ou appelez-nous directement. Nous sommes impatients de vous entendre et de répondre à vos besoins en matière de café indien.",
	openGraph: {
		title: "Accueil | Indian Coffee - Fast food indien à Savigny le Temple",
		description:
			"Contactez-nous pour toute demande, question ou commentaire. L'équipe d'Indian Coffee est là pour vous aider et vous offrir une expérience client exceptionnelle. Remplissez notre formulaire de contact ou appelez-nous directement. Nous sommes impatients de vous entendre et de répondre à vos besoins en matière de café indien.",
		siteName: "Indian Coffee",
		locale: "fr",
		url: "https://indiancoffee.fr/",
	},
};

const page = () => {
	return (
		<div className="px-4 sm:px-8 xl:px-24">
			<section className="pt-32">
				<Toaster />
				<h1 className="text-7xl font-caveat text-center text-white font-bold">
					Contact
				</h1>
			</section>

			<section className="grid grid-cols-2 justify-center items-center lg:mt-12 gap-12">
				<div className="grid grid-cols-6 lg:col-span-1 col-span-2 mt-12 lg:mt-0 justify-between gap-4 lg:gap-8">
					<CaseInfo
						icon={<IoLocationSharp className="w-12 h-12 text-[#C6AB71]" />}
						text="8 Impasse de l'Orée du bois, 77176 Savigny-le-Temple"
					/>
					<CaseInfo
						icon={<ImPhone className="w-12 h-12 text-[#C6AB71]" />}
						text="+33 (0)1 60 63 54 97"
					/>
					<CaseInfo
						icon={<SiMinutemailer className="w-12 h-12 text-[#C6AB71]" />}
						text="indiancoffee77@gmail.com"
					/>
				</div>
				<ContactForm />
			</section>

			<section className="flex justify-center items-center my-12">
				<iframe
					width="1500"
					height="600"
					id="gmap_canvas"
					src="https://maps.google.com/maps?width=200&amp;height=200&amp;hl=fr&amp;q=8%20impasse%20de%20l'or%C3%A9e%20du%20bois%20Savigny%20Le%20Tempe+(Restaurant%20-%20Indian%20Cofee)&amp;t=&amp;z=12&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
					className="rounded-xl"
					title="Indian Coffee Restaurant Location Map"
				/>
			</section>
		</div>
	);
};

const CaseInfo = ({ icon, text }: { icon: React.ReactNode; text: string }) => {
	return (
		<div className="col-span-6 md:col-span-3 lg:col-span-6 p-4 bg-gray-400 rounded-lg flex flex-row items-center justify-start">
			<div className="rounded-full bg-gray-300 p-2 mr-4">{icon && icon}</div>
			<h3 className="text-lg lg:text-xl font-semibold">{text}</h3>
		</div>
	);
};

export default page;
