import { ArrowDownIcon, ArrowRightIcon, SparklesIcon } from "lucide-react";
import { appUrl, headLinks, socialMeta } from "@/lib/head";
import { route } from "../root";

const concepts = [
  {
    id: "bleu-nuit",
    index: "01",
    name: "Maison de Madras",
    summary: "Éditorial · chaleureux · intemporel",
  },
  {
    id: "jardin",
    index: "02",
    name: "Jardin d’épices",
    summary: "Botanique · lumineux · vivant",
  },
  {
    id: "braise",
    index: "03",
    name: "Braise contemporaine",
    summary: "Graphique · nocturne · énergique",
  },
] as const;

export default route.page({
  component: () => (
    <div className="visual-lab">
      <section className="visual-lab-intro">
        <div>
          <p className="visual-lab-kicker">
            <SparklesIcon aria-hidden />
            Laboratoire d’identité
          </p>
          <h1>Trois façons de raconter Indian Coffee.</h1>
        </div>
        <div className="visual-lab-intro-copy">
          <p>
            Même restaurant, même contenu, mais trois tempéraments vraiment
            différents. Chaque piste travaille la couleur, le cadrage et le
            rythme — pas seulement un changement de teinte.
          </p>
          <a href="#bleu-nuit">
            Découvrir les pistes
            <ArrowDownIcon aria-hidden />
          </a>
        </div>
      </section>

      <nav aria-label="Accès aux pistes visuelles" className="visual-lab-nav">
        {concepts.map((concept) => (
          <a href={`#${concept.id}`} key={concept.id}>
            <span>{concept.index}</span>
            <strong>{concept.name}</strong>
          </a>
        ))}
      </nav>

      <article className="concept concept-nocturne" id="bleu-nuit">
        <header className="concept-caption">
          <div>
            <span>Piste 01</span>
            <h2>Maison de Madras</h2>
          </div>
          <p>
            Une maison de cuisine élégante, ancrée dans le bleu déjà présent
            dans la salle. L’orange devient un accent rare, donc plus précieux.
          </p>
          <ul aria-label="Palette de couleurs">
            <li style={{ "--swatch": "#071d2d" } as React.CSSProperties}>
              Nuit
            </li>
            <li style={{ "--swatch": "#f4ead7" } as React.CSSProperties}>
              Crème
            </li>
            <li style={{ "--swatch": "#e36e3d" } as React.CSSProperties}>
              Paprika
            </li>
          </ul>
        </header>

        <div className="nocturne-stage">
          <div className="nocturne-copy">
            <p className="nocturne-location">
              Savigny-le-Temple <span>Depuis 2012</span>
            </p>
            <h3>
              Le Sud
              <br />
              <em>à table.</em>
            </h3>
            <p className="nocturne-intro">
              Une cuisine indienne et sri-lankaise de transmission, généreuse et
              précise, servie comme à la maison.
            </p>
            <div className="nocturne-actions">
              <a href="/menu">
                Explorer la carte
                <ArrowRightIcon aria-hidden />
              </a>
              <a href="/contact">Réserver</a>
            </div>
          </div>
          <div className="nocturne-image">
            <img
              alt="Assortiment de spécialités Indian Coffee"
              decoding="async"
              height={432}
              loading="lazy"
              src="/public/cover1.webp"
              width={1000}
            />
            <div>
              <span>Ce soir</span>
              <strong>Service jusqu’à 22h30</strong>
            </div>
          </div>
          <p aria-hidden className="nocturne-mark">
            IC
          </p>
        </div>
      </article>

      <article className="concept concept-jardin" id="jardin">
        <header className="concept-caption">
          <div>
            <span>Piste 02</span>
            <h2>Jardin d’épices</h2>
          </div>
          <p>
            Plus organique et lumineux. Le vert profond relie la marque au mur
            végétal du restaurant, avec un rouge chutney très ponctuel.
          </p>
          <ul aria-label="Palette de couleurs">
            <li style={{ "--swatch": "#f3f0df" } as React.CSSProperties}>
              Ivoire
            </li>
            <li style={{ "--swatch": "#164b37" } as React.CSSProperties}>
              Feuille
            </li>
            <li style={{ "--swatch": "#c94330" } as React.CSSProperties}>
              Chutney
            </li>
          </ul>
        </header>

        <div className="jardin-stage">
          <div aria-hidden className="jardin-ornament jardin-ornament-one" />
          <div aria-hidden className="jardin-ornament jardin-ornament-two" />
          <div className="jardin-copy">
            <p className="jardin-eyebrow">Cuisine de famille · faite maison</p>
            <h3>
              Les épices
              <br />
              <em>prennent racine.</em>
            </h3>
            <p>
              Des recettes du Sud de l’Inde et du Sri Lanka, des produits frais
              et le temps de laisser chaque sauce trouver son équilibre.
            </p>
            <a href="/menu">
              La carte du moment
              <ArrowRightIcon aria-hidden />
            </a>
          </div>
          <div className="jardin-photos">
            <figure className="jardin-main-photo">
              <img
                alt="Thali servi chez Indian Coffee"
                decoding="async"
                height={667}
                loading="lazy"
                src="/public/cover4.webp"
                width={1000}
              />
              <figcaption>Le thali maison</figcaption>
            </figure>
            <figure className="jardin-side-photo">
              <img
                alt="Salle du restaurant Indian Coffee"
                decoding="async"
                height={750}
                loading="lazy"
                src="/public/cover5.webp"
                width={1000}
              />
              <figcaption>Notre maison à Savigny</figcaption>
            </figure>
          </div>
          <span className="jardin-seal">
            Depuis
            <br />
            2012
          </span>
        </div>
      </article>

      <article className="concept concept-braise" id="braise">
        <header className="concept-caption">
          <div>
            <span>Piste 03</span>
            <h2>Braise contemporaine</h2>
          </div>
          <p>
            Une présence urbaine, franche et actuelle. Typographie massive,
            contraste charbon/corail et photo sans filtre pour faire sentir le
            feu du service.
          </p>
          <ul aria-label="Palette de couleurs">
            <li style={{ "--swatch": "#181818" } as React.CSSProperties}>
              Charbon
            </li>
            <li style={{ "--swatch": "#ff5c39" } as React.CSSProperties}>
              Braise
            </li>
            <li style={{ "--swatch": "#e8e2d6" } as React.CSSProperties}>
              Craie
            </li>
          </ul>
        </header>

        <div className="braise-stage">
          <div aria-hidden className="braise-ticker">
            <span>INDIAN COFFEE</span>
            <span>INDIAN COFFEE</span>
            <span>INDIAN COFFEE</span>
          </div>
          <div className="braise-copy">
            <p>Inde du Sud × Sri Lanka</p>
            <h3>
              Ça mijote.
              <br />
              Ça crépite.
              <br />
              <span>Ça se partage.</span>
            </h3>
            <div>
              <a href="/contact">
                Réserver une table
                <ArrowRightIcon aria-hidden />
              </a>
              <p>
                Ouvert aujourd’hui
                <strong>11h — 22h30</strong>
              </p>
            </div>
          </div>
          <div className="braise-image">
            <img
              alt="Kottu préparé chez Indian Coffee"
              decoding="async"
              height={432}
              loading="lazy"
              src="/public/cover3.webp"
              width={1000}
            />
            <p>01 / Savigny-le-Temple</p>
          </div>
          <p className="braise-stamp">
            Maison
            <br />
            depuis
            <br />
            2012
          </p>
        </div>
      </article>

      <section className="visual-lab-choice">
        <p>Prochaine étape</p>
        <h2>Choisis une piste, ou mélange deux directions.</h2>
        <p>
          Une fois la direction choisie, elle pourra être déclinée sur
          l’accueil, la carte, la galerie, la réservation et le mobile.
        </p>
      </section>
    </div>
  ),
  head: () => ({
    links: headLinks({ href: `${appUrl}/visuals`, rel: "canonical" }),
    meta: [
      ...socialMeta({
        description:
          "Trois directions artistiques proposées pour le site Indian Coffee.",
        image: `${appUrl}/public/cover1.webp`,
        title: "Pistes visuelles · Indian Coffee",
        url: `${appUrl}/visuals`,
      }),
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});
