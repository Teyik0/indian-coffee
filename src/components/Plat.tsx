interface IProps {
	title: string;
	details: string;
	price: string;
	fullProps?: boolean;
}

export const Plat = ({ title, details, price, fullProps }: IProps) => {
	const style = fullProps ? "w-full" : "w-full sm:w-1/2";
	return (
		<div className={`flex flex-row ${style} justify-beween items-center`}>
			<div className="flex flex-col w-full mb-2 mt-2">
				<h3 className="tracking-wide text-xl uppercase">{title}</h3>
				<p className="text-xs font-semibold w-4/5">{details}</p>
			</div>
			{price != "" && (
				<div className="flex flex-row">
					<p className="tracking-widest">...........</p>
					<span>{price}</span>
				</div>
			)}
		</div>
	);
};
