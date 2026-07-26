import { renderServerComponent } from "@teyik0/furin/rsc";
import { route } from "./root";

export default route.page({
  tags: ["content"],
  loader: async () => ({
    content: await renderServerComponent(
      <article className="prose prose-stone mx-auto max-w-3xl px-5 py-16">
        <p className="font-semibold uppercase tracking-[0.22em] text-primary text-xs">
          Vos données
        </p>
        <h1 className="font-display text-5xl">Politique de confidentialité</h1>
        <p>
          Les informations du formulaire de réservation sont utilisées
          uniquement pour répondre à votre demande et organiser votre venue.
        </p>
        <h2 className="font-display text-2xl">Durée de conservation</h2>
        <p>
          Les demandes sont conservées pendant douze mois, puis supprimées ou
          anonymisées.
        </p>
        <h2 className="font-display text-2xl">Vos droits</h2>
        <p>
          Vous pouvez demander l’accès, la rectification ou la suppression de
          vos informations en écrivant à indiancoffee77@gmail.com.
        </p>
      </article>,
    ),
  }),
  head: () => ({
    meta: [
      { title: "Confidentialité · Indian Coffee" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: ({ content }) => content,
});
