/**
 * Toutes les infos de l'événement au même endroit.
 * ⚠️ Lieu, horaires et programme sont PROVISOIRES — à remplacer dès que
 * les vraies infos sont connues (le site, le PDF du billet et l'email
 * lisent tous ce fichier).
 */

export const EVENT = {
  name: "AI-BID 2027",
  kind: "Masterclass",
  theme: "L'intelligence artificielle au service du montage des offres de marchés publics",
  tagline: "Analysez, préparez et vérifiez plus rapidement avec l'IA",
  /** Jour de l'événement (heure de Cotonou, UTC+1). */
  startsAt: "2027-02-27T08:00:00+01:00",
  endsAt: "2027-02-27T17:30:00+01:00",
  datesLabel: "Samedi 27 février 2027",
  dateShort: "27 février 2027",
  datesShort: "27 FÉV. 2027",
  venue: "Palais des Congrès de Cotonou",
  venueShort: "Palais des Congrès",
  city: "Cotonou, Bénin",
  hours: "Accueil dès 08h00 · Sessions de 09h00 à 17h30",
  hoursShort: "08h00 – 17h30",
  fundraising: {
    label: "Séance de levée de fonds e-BIDDER",
    datesLabel: "Dimanche 28 février 2027",
    hours: "09h00 – 13h00",
  },
  training: {
    label: "Formation pratique sur le montage des offres",
    datesLabel: "15 – 19 février 2027",
    hours: "Du lundi au vendredi, 09h00 – 13h00",
    venue: "Siège e-BIDDER, Cotonou",
  },
} as const;

export const ORGANIZER = {
  name: "e-BIDDER",
  baseline: "Montage & Gestion des dossiers de soumission",
  site: "https://www.ebidder.bj",
  email: "contact@ebidder.bj",
  phone: "+229 01 66 54 17 08",
  phoneHref: "tel:+2290166541708",
  whatsapp: "https://wa.me/22966541708",
  address: "Cotonou, Bénin",
} as const;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://ai-bidder.com").replace(/\/+$/, "");

export type TierId = "essentiel" | "pro" | "premium";

export interface Tier {
  id: TierId;
  name: string;
  short: string;
  price: number;
  pitch: string;
  /** Couleur principale du billet. */
  color: string;
  /** Couleur d'accent (texte sur fond coloré, filets). */
  ink: string;
  included: string[];
  bonus: string[];
}

export const TIERS: Tier[] = [
  {
    id: "essentiel",
    name: "Ticket Essentiel",
    short: "ESSENTIEL",
    price: 20_000,
    pitch: "L'essentiel pour participer à AI-BID 2027",
    color: "#4E72B3",
    ink: "#FFFFFF",
    included: [
      "Livre « Comment gagner des marchés publics ? »",
      "Accès à AI-BID 2027 (samedi 27 février)",
      "Networking & réseautage professionnel",
    ],
    bonus: ["Échanges et rencontres avec les participants"],
  },
  {
    id: "pro",
    name: "Ticket Pro",
    short: "PRO",
    price: 50_000,
    pitch: "Pour apprendre à mieux préparer ses offres",
    color: "#FE7200",
    ink: "#FFFFFF",
    included: [
      "Livre « Comment gagner des marchés publics ? »",
      "Accès à AI-BID 2027 (samedi 27 février)",
      "Formation pratique d'une semaine sur le montage des offres",
      "Attestation de formation",
      "Networking & réseautage professionnel",
    ],
    bonus: ["Participation à la formation complète", "Attestation remise pendant l'événement"],
  },
  {
    id: "premium",
    name: "Ticket Premium",
    short: "PREMIUM",
    price: 100_000,
    pitch: "Pour intégrer un cercle privilégié d'entrepreneurs",
    color: "#4B2283",
    ink: "#EFBB59",
    included: [
      "Livre « Comment gagner des marchés publics ? »",
      "Accès à AI-BID 2027 (samedi 27 février)",
      "Formation pratique d'une semaine sur le montage des offres",
      "Attestation de formation",
      "Networking & réseautage professionnel",
      "Soirée privée des entrepreneurs des marchés publics",
      "Séance de levée de fonds d'e-BIDDER (dimanche 28 février)",
    ],
    bonus: ["Cercle privé d'entrepreneurs", "Rencontres avec partenaires et acteurs de l'écosystème"],
  },
];

export const tierById = (id: string): Tier | undefined => TIERS.find((t) => t.id === id);

export const MAX_TICKETS_PER_ORDER = 20;

export function formatFcfa(n: number): string {
  return `${n.toLocaleString("fr-FR").replace(/\s/g, " ")} FCFA`;
}

export interface ProgrammeSlot {
  time: string;
  title: string;
  detail?: string;
  /** Réservé à certaines formules. */
  only?: TierId[];
}

export interface ProgrammeDay {
  id: string;
  /** Étiquette de l'onglet (ex. « L'événement »). */
  tag: string;
  date: string;
  weekday: string;
  title: string;
  intro?: string;
  slots: ProgrammeSlot[];
  only?: TierId[];
}

/** Programme PROVISOIRE. */
export const PROGRAMME: ProgrammeDay[] = [
  {
    id: "formation",
    tag: "Avant l'événement",
    date: "15 – 19 fév.",
    weekday: "Lun. → Ven.",
    title: "La semaine de formation",
    intro: "Réservée aux tickets Pro et Premium. Cinq matinées en petit groupe au siège d'e-BIDDER. Les attestations sont remises le samedi 27 février, pendant l'événement.",
    only: ["pro", "premium"],
    slots: [
      { time: "Lundi", title: "Lire un DAO sans rien rater", detail: "Critères de qualification, pièces exigées, pièges récurrents." },
      { time: "Mardi", title: "Le dossier administratif", detail: "Constituer, vérifier et dater chaque pièce." },
      { time: "Mercredi", title: "L'offre technique", detail: "Méthodologie, planning, moyens humains et matériels." },
      { time: "Jeudi", title: "L'offre financière", detail: "Bordereaux, devis quantitatif, cohérence des prix." },
      { time: "Vendredi", title: "Montage complet avec l'IA", detail: "Cas réel monté de bout en bout, revue croisée." },
    ],
  },
  {
    id: "evenement",
    tag: "L'événement",
    date: "27 fév.",
    weekday: "Samedi",
    title: "La masterclass AI-BID 2027",
    intro: "Ouverte à tous les billets. Une journée pour voir l'IA à l'œuvre sur de vrais dossiers, de l'analyse du DAO au contrôle avant dépôt.",
    slots: [
      { time: "08h00", title: "Accueil, remise des badges et du livre" },
      { time: "09h00", title: "Cérémonie d'ouverture" },
      { time: "09h30", title: "Conférence : pourquoi tant d'offres sont rejetées", detail: "Les motifs d'élimination les plus fréquents dans la commande publique." },
      { time: "10h30", title: "Démonstration : analyser un DAO avec l'IA" },
      { time: "11h30", title: "Atelier : identifier les exigences et les pièces obligatoires" },
      { time: "13h00", title: "Pause déjeuner et networking" },
      { time: "14h00", title: "Atelier : préparer l'offre technique avec l'IA" },
      { time: "15h15", title: "Cas pratique : vérifier et contrôler un dossier", detail: "Un appel d'offres réel, passé au crible en direct." },
      { time: "16h30", title: "Remise des attestations de formation", only: ["pro", "premium"] },
      { time: "17h00", title: "Échanges, networking et clôture" },
      { time: "19h30", title: "Soirée privée des entrepreneurs des marchés publics", only: ["premium"] },
    ],
  },
  {
    id: "levee",
    tag: "Levée de fonds",
    date: "28 fév.",
    weekday: "Dimanche",
    title: "La séance de levée de fonds e-BIDDER",
    intro: "Réservée aux tickets Premium. Une matinée de rencontres autour du projet e-BIDDER et de sa levée de fonds, avec les partenaires et acteurs de l'écosystème.",
    only: ["premium"],
    slots: [
      { time: "09h00", title: "Accueil des participants" },
      { time: "09h30", title: "e-BIDDER : vision, marché et résultats" },
      { time: "10h30", title: "Le projet de levée de fonds : besoins et feuille de route" },
      { time: "11h30", title: "Échanges avec les partenaires et acteurs de l'écosystème" },
      { time: "12h30", title: "Cocktail de networking et clôture" },
    ],
  },
];

export const AUDIENCE = [
  "PME et grandes entreprises",
  "Entrepreneurs",
  "Professionnels des marchés publics",
  "Consultants",
  "Responsables administratifs et commerciaux",
  "Jeunes professionnels et étudiants",
];

/** Ce que les participants vont découvrir (fiche de présentation). */
export const DISCOVER = [
  "Analyser rapidement un DAO avec l'IA",
  "Identifier les exigences et les pièces obligatoires",
  "Se faire assister dans la préparation de l'offre technique",
  "Vérifier et contrôler son dossier avant le dépôt",
  "Utiliser concrètement différents outils d'IA",
  "Démonstrations et cas concrets",
  "Des solutions numériques dédiées aux marchés publics",
];

export const FORMAT = ["Présentations", "Démonstrations", "Cas pratiques", "Échanges", "Networking"];

export const SIGNATURE = "Mettre l'intelligence artificielle au service d'offres de marchés publics plus rapides, plus efficaces et plus compétitives.";

export const BOOK = {
  title: "Comment gagner des marchés publics ?",
  subtitle: "Le guide pratique du stratège (GPS)",
  author: "Aimé Jacquet SETO",
  url: "https://aimeseto.systeme.io/712f0289-639b361c",
};

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Comment je reçois mon billet ?",
    a: "Dès que le paiement est confirmé, votre billet s'affiche à l'écran et vous le recevez par email en PDF. Il sert aussi de reçu. Imprimez-le ou présentez-le sur votre téléphone à l'entrée.",
  },
  {
    q: "Puis-je acheter plusieurs billets ?",
    a: "Oui, jusqu'à 20 billets par commande, de formules différentes si besoin. Indiquez le nom de chaque participant : chaque billet est nominatif et porte son propre QR code.",
  },
  {
    q: "Quels moyens de paiement sont acceptés ?",
    a: "Mobile Money (MTN, Moov, Celtiis) et carte bancaire, via FedaPay. Le paiement est sécurisé et vous ne communiquez jamais vos codes à e-BIDDER.",
  },
  {
    q: "Quand a lieu la formation des tickets Pro et Premium ?",
    a: "La semaine précédant l'événement, du 15 au 19 février 2027. Les attestations sont remises le samedi 27 février, pendant AI-BID 2027.",
  },
  {
    q: "Je n'ai pas reçu l'email, que faire ?",
    a: "Vérifiez vos spams, puis écrivez-nous sur WhatsApp avec le numéro de commande : nous vous renvoyons votre billet.",
  },
  {
    q: "Puis-je obtenir une facture au nom de mon entreprise ?",
    a: "Oui. Renseignez le nom de l'entreprise lors de la commande : il figure sur le reçu. Pour une facture normalisée, contactez-nous.",
  },
];
