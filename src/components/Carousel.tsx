"use client";

import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const buttonStyle =
	"rounded-full bg-white/60 shadow-l hover:bg-white transition duration-300";

interface CarouselProps {
	children: React.ReactNode;
	length: number;
	autoSlide?: boolean;
	autoSlideInterval?: number;
}

export const Carousel = ({
	children: slides,
	length,
	autoSlide = false,
	autoSlideInterval = 6000,
}: CarouselProps) => {
	const [current, setCurrent] = useState(0);

	const handleNext = () => {
		setCurrent((prev) => (current === length - 1 ? 0 : prev + 1));
	};

	const handlePrev = () => {
		setCurrent((prev) => (current === 0 ? length - 1 : prev - 1));
	};

	useEffect(() => {
		if (!autoSlide) return;
		const slideInterval = setInterval(handleNext, autoSlideInterval);
		return () => clearInterval(slideInterval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [current]);

	return (
		<div className="overflow-hidden relative mt-4 w-full">
			<div
				className="flex transition-transform ease-out duration-500"
				style={{ transform: `translateX(-${current * 100}%` }}
			>
				{slides}
			</div>
			<div className="absolute inset-0 flex items-center justify-between px-2">
				<button
					type="button"
					onClick={() => handlePrev()}
					className={buttonStyle}
				>
					<FiChevronLeft size={40} />
				</button>
				<button
					type="button"
					onClick={() => handleNext()}
					className={buttonStyle}
				>
					<FiChevronRight size={40} />
				</button>
			</div>
			<div className="absolute bottom-4 right-0 left-0">
				<div className="flex items-center justify-center gap-4">
					{Array.from({ length: length }).map((_, index) => (
						<div
							className={`transition-all rounded-full h-4 w-4 bg-blue-800 ${
								current === index ? "p-3" : "bg-opacity-50"
							} cursor-pointer hover:bg-opacity-100`}
							key={index}
							onClick={() => setCurrent(index)}
						/>
					))}
				</div>
			</div>
		</div>
	);
};
