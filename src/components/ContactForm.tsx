"use client";

import emailjs from "@emailjs/browser";
import { useState } from "react";
import toast from "react-hot-toast";

export const ContactForm = () => {
	const [form, setForm] = useState({
		name: "",
		prenom: "",
		phone: "",
		email: "",
		message: "",
	});

	const handleChange = (
		e:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLTextAreaElement>,
		inputName: "name" | "prenom" | "phone" | "email" | "message",
	) => {
		setForm({
			...form,
			[inputName]: e.target.value,
		});
	};

	const styleLabel = "font-semibold text-lg text-white";
	const styleInput =
		"rounded-lg p-2 font-normal text-md text-black outline-hidden bg-white border-black border-2";

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (
			!form.name ||
			!form.prenom ||
			!form.phone ||
			!form.email ||
			!form.message
		) {
			toast.error("Veuillez remplir tous les champs !");
			return;
		}
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(form.email)) {
			toast.error("Email invalide !");
			return;
		}
		const notification = toast.loading("Loading...");

		emailjs
			.send(
				process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string,
				process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string,
				{
					from_name: `${form.prenom} ${form.name}`,
					to_name: "Indian Coffee",
					from_email: form.email,
					to_email: "connectinnov@gmail.com",
					message: `${form.message}`,
				},
				process.env.NEXT_PUBLIC_EMAILJS_TOKEN as string,
			)
			.then(() => {
				toast.success(
					"Demande de contact envoyé, nous reviendrons vers vous dès que possible",
					{ id: notification },
				);
			})
			.catch((error) => {
				console.error(error);
				toast.error("Message non envoyé, veuillez réessayez plus tard", {
					id: notification,
				});
			})
			.finally(() => {
				setForm({
					name: "",
					prenom: "",
					phone: "",
					email: "",
					message: "",
				});
			});
	};

	return (
		<div className="lg:col-span-1 col-span-2">
			<div className="grid grid-cols-2 mb-4 gap-4 w-full">
				<div className="sm:col-span-1 col-span-2 flex flex-col">
					<label htmlFor="firstname" className={styleLabel}>
						Prénom*
					</label>
					<input
						type="text"
						name="firstname"
						value={form.prenom}
						onChange={(e: any) => handleChange(e, "prenom")}
						className={styleInput}
					/>
				</div>
				<div className="sm:col-span-1 col-span-2 flex flex-col">
					<label htmlFor="name" className={styleLabel}>
						Nom*
					</label>
					<input
						type="text"
						name="name"
						value={form.name}
						onChange={(e: any) => handleChange(e, "name")}
						className={styleInput}
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 mb-4 gap-4 w-full">
				<div className="sm:col-span-1 col-span-2 flex flex-col">
					<label htmlFor="email" className={styleLabel}>
						E-mail*
					</label>
					<input
						type="email"
						name="firstname"
						value={form.email}
						onChange={(e: any) => handleChange(e, "email")}
						className={styleInput}
					/>
				</div>
				<div className="sm:col-span-1 col-span-2 flex flex-col">
					<label htmlFor="name" className={styleLabel}>
						Téléphone*
					</label>
					<input
						type="text"
						name="telephone"
						value={form.phone}
						onChange={(e: any) => handleChange(e, "phone")}
						className={styleInput}
					/>
				</div>
			</div>

			<div className="flex flex-col">
				<label htmlFor="message" className={styleLabel}>
					Message*
				</label>
				<textarea
					name="message"
					value={form.message}
					onChange={(e: any) => handleChange(e, "message")}
					className={`rounded-lg p-2 font-normal text-md text-black
            outline-hidden bg-white border-black border-2 min-h-[150px]`}
				/>
			</div>
			<button
				type="submit"
				className="p-16 pt-4 pb-4 bg-[#C6AB71] rounded-lg font-bold hover:text-[#C6AB71]
          hover:bg-white duration-500 text-xl mt-8 w-full"
				onClick={(e: any) => handleSubmit(e)}
			>
				Envoyer
			</button>
		</div>
	);
};
