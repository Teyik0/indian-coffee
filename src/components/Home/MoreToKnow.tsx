import Link from "next/link";

export const Card = ({
	title,
	description,
	link,
}: {
	title: string;
	description: string;
	link: string;
}) => (
	<div
		className="col-span-6 sm:col-span-3 lg:col-span-2 flex flex-col h-[400px]
    bg-[#3a3737] rounded-xl lg:p-8 text-center justify-center items-center text-white"
	>
		<h3 className="opacity-70 font-bold uppercase text-2xl text-[#ac854d]">
			{title}
		</h3>
		<p className="mt-4 font-semibold">{description}</p>
		<Link
			href={link}
			className="rounded-xl mt-12 px-8 py-4 bg-white text-black
      font-bold border-2 border-gray-800 hover:scale-110 duration-300 ease-in-out"
		>
			Cliquez ici
		</Link>
	</div>
);

export const MoreToKnow = () => {
	return (
		<section className="pb-12 px-4 sm:px-8 flex flex-col justify-center items-center">
			<div className="grid grid-cols-6 w-full gap-4 justify-center items-center">
				<Card
					title="Nos menus"
					description="Découvrir nos menus délicieux"
					link="/menu"
				/>
				<Card
					title="Galerie"
					description="Explorez notre galerie de photos"
					link="/galerie"
				/>
				<Card
					title="Contact"
					description="Nous contactez pour plus d'informations"
					link="/contact"
				/>
			</div>
		</section>
	);
};
