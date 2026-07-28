import {
  CalendarClockIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleGaugeIcon,
  Clock3Icon,
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  NotebookTabsIcon,
  SoupIcon,
  UsersIcon,
  UtensilsCrossedIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const reservations = [
  { guests: 4, name: "Aïcha Rahman", status: "Confirmée", time: "19:30" },
  { guests: 2, name: "Léo Martin", status: "À confirmer", time: "20:00" },
  { guests: 6, name: "Samira B.", status: "Confirmée", time: "20:30" },
] as const;

function MiniLogo() {
  return (
    <img
      alt=""
      className="admin-concept-logo"
      height={32}
      src="/admin/public/indian-coffee-logo.webp"
      width={32}
    />
  );
}

function ServiceConcept() {
  return (
    <div className="admin-preview admin-preview-service">
      <aside className="service-rail">
        <div className="service-brand">
          <MiniLogo />
          <strong>Indian Coffee</strong>
        </div>
        <nav aria-label="Navigation de démonstration">
          <a aria-current="page" href="#service">
            <LayoutDashboardIcon />
            <span>Accueil</span>
          </a>
          <a href="#service-reservations">
            <UtensilsCrossedIcon />
            <span>Réservations</span>
            <b>1</b>
          </a>
          <a href="#service-horaires">
            <CalendarClockIcon />
            <span>Horaires</span>
          </a>
          <a href="#service-carte">
            <SoupIcon />
            <span>Carte</span>
          </a>
          <a href="#service-contenu">
            <NotebookTabsIcon />
            <span>Contenu</span>
          </a>
        </nav>
        <div className="service-profile">
          <span>TS</span>
          <p>
            <strong>Théo</strong>
            <small>Administrateur</small>
          </p>
          <MoreHorizontalIcon />
        </div>
      </aside>

      <section className="service-main">
        <header className="service-topbar">
          <p>
            <span />
            Restaurant ouvert
          </p>
          <small>Mardi 28 juillet · 18:42</small>
        </header>
        <div className="service-content">
          <div className="service-heading">
            <div>
              <p>Bonsoir Théo</p>
              <h3>Le service, en un coup d’œil.</h3>
            </div>
            <button type="button">
              <CalendarDaysIcon />
              Voir les réservations
            </button>
          </div>

          <div className="service-metrics">
            <article>
              <span>01</span>
              <p>À confirmer</p>
              <strong>1</strong>
              <small>Une réponse attendue</small>
            </article>
            <article>
              <span>02</span>
              <p>Ce soir</p>
              <strong>12</strong>
              <small>34 couverts prévus</small>
            </article>
            <article>
              <span>03</span>
              <p>Carte active</p>
              <strong>48</strong>
              <small>3 plats indisponibles</small>
            </article>
          </div>

          <div className="service-grid">
            <article className="service-reservations">
              <header>
                <div>
                  <p>Prochaines arrivées</p>
                  <h4>Service du soir</h4>
                </div>
                <button aria-label="Voir toutes les réservations" type="button">
                  <ChevronRightIcon />
                </button>
              </header>
              <ul>
                {reservations.map((reservation) => (
                  <li key={`${reservation.name}-${reservation.time}`}>
                    <time>{reservation.time}</time>
                    <p>
                      <strong>{reservation.name}</strong>
                      <small>{reservation.guests} personnes</small>
                    </p>
                    <span
                      data-status={
                        reservation.status === "À confirmer"
                          ? "pending"
                          : "confirmed"
                      }
                    >
                      {reservation.status}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="service-readiness">
              <header>
                <p>Avant le service</p>
                <strong>75%</strong>
              </header>
              <div>
                <span />
              </div>
              <ul>
                <li>
                  <CheckIcon />
                  Horaires vérifiés
                </li>
                <li>
                  <CheckIcon />
                  Carte mise à jour
                </li>
                <li data-todo>
                  <span />
                  Confirmer la demande
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

function EditorialConcept() {
  return (
    <div className="admin-preview admin-preview-editorial">
      <header className="editorial-topbar">
        <a className="editorial-brand" href="#editorial">
          <MiniLogo />
          <span>
            <strong>Indian Coffee</strong>
            <small>Maison de cuisine</small>
          </span>
        </a>
        <nav aria-label="Navigation de démonstration">
          <a aria-current="page" href="#editorial">
            Aujourd’hui
          </a>
          <a href="#editorial-reservations">Réservations</a>
          <a href="#editorial-carte">La carte</a>
          <a href="#editorial-maison">La maison</a>
        </nav>
        <button aria-label="Compte utilisateur" type="button">
          TS
        </button>
      </header>

      <section className="editorial-content">
        <div className="editorial-date">
          <p>Mardi</p>
          <strong>28</strong>
          <span>Juillet 2026</span>
        </div>
        <div className="editorial-intro">
          <p>Tableau de bord</p>
          <h3>Bonsoir Théo, la salle se prépare.</h3>
          <div>
            <span>Ouvert maintenant</span>
            <small>Fermeture à 22h30</small>
          </div>
        </div>

        <article className="editorial-focus">
          <p>À traiter maintenant</p>
          <div>
            <strong>1</strong>
            <span>
              demande
              <br />
              de réservation
            </span>
          </div>
          <button type="button">
            Répondre à la demande
            <ChevronRightIcon />
          </button>
        </article>

        <article className="editorial-book">
          <header>
            <div>
              <p>Le carnet de ce soir</p>
              <h4>12 réservations · 34 couverts</h4>
            </div>
            <button type="button">Tout afficher</button>
          </header>
          <ul>
            {reservations.map((reservation, index) => (
              <li key={`${reservation.time}-${reservation.name}`}>
                <time>{reservation.time}</time>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>
                  <strong>{reservation.name}</strong>
                  <small>Table de {reservation.guests}</small>
                </p>
                <em>{reservation.status}</em>
              </li>
            ))}
          </ul>
        </article>

        <aside className="editorial-notes">
          <p>Notes de service</p>
          <blockquote>
            Pensez à remettre le biryani d’agneau à la carte avant 19h.
          </blockquote>
          <button type="button">
            <MessageCircleIcon />
            Ajouter une note
          </button>
        </aside>
      </section>
    </div>
  );
}

function SignalConcept() {
  return (
    <div className="admin-preview admin-preview-signal">
      <aside className="signal-rail">
        <div>
          <MiniLogo />
          <span>IC</span>
        </div>
        <nav aria-label="Navigation de démonstration">
          <a aria-current="page" href="#signal">
            <CircleGaugeIcon />
            <span>Vue d’ensemble</span>
          </a>
          <a href="#signal-reservations">
            <UtensilsCrossedIcon />
            <span>Réservations</span>
          </a>
          <a href="#signal-horaires">
            <Clock3Icon />
            <span>Horaires</span>
          </a>
          <a href="#signal-carte">
            <SoupIcon />
            <span>Carte</span>
          </a>
          <a href="#signal-medias">
            <GalleryVerticalEndIcon />
            <span>Médias</span>
          </a>
          <a href="#signal-equipe">
            <UsersIcon />
            <span>Équipe</span>
          </a>
        </nav>
        <button aria-label="Compte utilisateur" type="button">
          TS
        </button>
      </aside>

      <section className="signal-main">
        <header className="signal-topbar">
          <p>
            IC / OPS <span>Dashboard</span>
          </p>
          <div>
            <span>Paris · 18:42:16</span>
            <b>Live</b>
          </div>
        </header>

        <div className="signal-content">
          <header className="signal-heading">
            <div>
              <p>Service du mardi 28.07</p>
              <h3>Tout est presque prêt.</h3>
            </div>
            <button type="button">
              Ouvrir le planning
              <ChevronRightIcon />
            </button>
          </header>

          <div className="signal-metrics">
            <article data-tone="hot">
              <small>Demandes</small>
              <strong>01</strong>
              <p>À traiter</p>
              <span>Action requise</span>
            </article>
            <article>
              <small>Réservations</small>
              <strong>12</strong>
              <p>Ce soir</p>
              <span>34 couverts</span>
            </article>
            <article>
              <small>Disponibilité</small>
              <strong>94%</strong>
              <p>De la carte</p>
              <span>3 plats masqués</span>
            </article>
            <article data-tone="live">
              <small>Restaurant</small>
              <strong>ON</strong>
              <p>Ouvert</p>
              <span>Ferme à 22:30</span>
            </article>
          </div>

          <div className="signal-grid">
            <article className="signal-timeline">
              <header>
                <div>
                  <span />
                  <p>Flux des arrivées</p>
                </div>
                <small>19:00 — 22:30</small>
              </header>
              <div className="signal-chart">
                <span style={{ "--height": "24%" } as React.CSSProperties} />
                <span style={{ "--height": "42%" } as React.CSSProperties} />
                <span style={{ "--height": "71%" } as React.CSSProperties} />
                <span style={{ "--height": "92%" } as React.CSSProperties} />
                <span style={{ "--height": "62%" } as React.CSSProperties} />
                <span style={{ "--height": "82%" } as React.CSSProperties} />
                <span style={{ "--height": "48%" } as React.CSSProperties} />
                <span style={{ "--height": "29%" } as React.CSSProperties} />
              </div>
              <footer>
                <span>19h</span>
                <span>20h</span>
                <span>21h</span>
                <span>22h</span>
              </footer>
            </article>

            <article className="signal-queue">
              <header>
                <p>Prochaines tables</p>
                <span>3</span>
              </header>
              <ul>
                {reservations.map((reservation) => (
                  <li key={`signal-${reservation.name}`}>
                    <time>{reservation.time}</time>
                    <p>
                      <strong>{reservation.name}</strong>
                      <small>{reservation.guests} pers.</small>
                    </p>
                    <ChevronRightIcon />
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

const concepts = [
  {
    component: <ServiceConcept />,
    id: "service",
    name: "Comptoir",
    note: "Recommandée",
    summary:
      "La plus efficace au quotidien : hiérarchie immédiate, actions prioritaires et chaleur de la marque sans surcharge.",
    traits: ["Opérationnelle", "Chaleureuse", "Très lisible"],
  },
  {
    component: <EditorialConcept />,
    id: "editorial",
    name: "Carnet",
    note: "Éditoriale",
    summary:
      "Une interface plus singulière et hospitalière, pensée comme le carnet de service d’une maison de cuisine.",
    traits: ["Élégante", "Aérée", "Différenciante"],
  },
  {
    component: <SignalConcept />,
    id: "signal",
    name: "Signal",
    note: "Nocturne",
    summary:
      "Un poste de pilotage dense et contrasté, idéal si tu veux assumer un back-office très contemporain.",
    traits: ["Technique", "Dense", "Énergique"],
  },
] as const;

export function AdminDesignLab() {
  return (
    <Tabs className="admin-design-lab" defaultValue="service">
      <TabsList
        aria-label="Choisir une piste visuelle"
        className="admin-design-tabs"
        variant="line"
      >
        {concepts.map((concept, index) => (
          <TabsTrigger key={concept.id} value={concept.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{concept.name}</strong>
            <small>{concept.note}</small>
          </TabsTrigger>
        ))}
      </TabsList>

      {concepts.map((concept) => (
        <TabsContent
          className="admin-design-panel"
          key={concept.id}
          value={concept.id}
        >
          <div className="admin-design-caption">
            <div>
              <Badge
                variant={concept.id === "service" ? "secondary" : "outline"}
              >
                Piste {concept.name}
              </Badge>
              <p>{concept.summary}</p>
            </div>
            <ul aria-label="Caractéristiques de la piste">
              {concept.traits.map((trait) => (
                <li key={trait}>{trait}</li>
              ))}
            </ul>
          </div>
          <div className="admin-design-browser">
            <div aria-hidden className="admin-design-browser-bar">
              <span />
              <span />
              <span />
              <p>admin.indiancoffee.fr</p>
            </div>
            {concept.component}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
