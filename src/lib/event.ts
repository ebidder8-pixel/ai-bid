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
  /** Jours de l'événement (heure de Cotonou, UTC+1). */
  startsAt: "2027-02-26T08:30:00+01:00",
  endsAt: "2027-02-28T13:00:00+01:00",
  datesLabel: "26 – 28 février 2027",
  datesShort: "26-28 FÉV. 2027",
  venue: "Palais des Congrès de Cotonou",
  venueShort: "Palais des Congrès",
  city: "Cotonou, Bénin",
  hours: "Accueil dès 08h00 · Sessions de 08h30 à 17h30",
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
      "Accès aux 3 jours d'AI-BID 2027",
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
      "Accès aux 3 jours d'AI-BID 2027",
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
      "Accès aux 3 jours d'AI-BID 2027",
      "Formation pratique d'une semaine sur le montage des offres",
      "Attestation de formation",
      "Networking & réseautage professionnel",
      "Soirée privée des entrepreneurs des marchés publics",
      "Accès privilégié aux rencontres liées à la levée de fonds d'e-BIDDER",
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
  date: string;
  weekday: string;
  title: string;
  slots: ProgrammeSlot[];
  only?: TierId[];
}

/** Programme PROVISOIRE. */
export const PROGRAMME: ProgrammeDay[] = [
  {
    id: "formation",
    date: "15 – 19 fév.",
    weekday: "Lun. → Ven.",
    title: "La semaine de formation",
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
    id: "j1",
    date: "26 fév.",
    weekday: "Vendredi",
    title: "Comprendre et analyser",
    slots: [
      { time: "08h30", title: "Accueil, remise des badges et du livre" },
      { time: "09h30", title: "Cérémonie d'ouverture" },
      { time: "10h15", title: "Conférence : pourquoi tant d'offres sont rejetées", detail: "Les motifs d'élimination les plus fréquents dans la commande publique." },
      { time: "11h30", title: "Démonstration : analyser un dossier d'appel d'offres avec l'IA" },
      { time: "14h00", title: "Panel : l'IA et la commande publique en Afrique de l'Ouest" },
      { time: "16h00", title: "Networking" },
    ],
  },
  {
    id: "j2",
    date: "27 fév.",
    weekday: "Samedi",
    title: "Préparer son offre",
    slots: [
      { time: "08h30", title: "Atelier : le dossier administratif sans erreur" },
      { time: "10h30", title: "Atelier : rédiger l'offre technique avec l'IA" },
      { time: "14h00", title: "Cas pratique en équipe", detail: "Un appel d'offres réel, monté en direct." },
      { time: "16h30", title: "Rencontres entre participants" },
      { time: "19h30", title: "Soirée privée des entrepreneurs des marchés publics", only: ["premium"] },
    ],
  },
  {
    id: "j3",
    date: "28 fév.",
    weekday: "Dimanche",
    title: "Vérifier et conclure",
    slots: [
      { time: "09h00", title: "Atelier : vérifier la conformité avant dépôt" },
      { time: "10h30", title: "Session levée de fonds e-BIDDER", detail: "Rencontre avec les partenaires et acteurs de l'écosystème.", only: ["premium"] },
      { time: "11h30", title: "Remise des attestations de formation", only: ["pro", "premium"] },
      { time: "12h30", title: "Clôture" },
    ],
  },
];

export const AUDIENCE = [
  "Entrepreneurs",
  "PME",
  "Professionnels des marchés publics",
  "Consultants",
  "Jeunes professionnels",
];

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
    a: "La semaine précédant l'événement, du 15 au 19 février 2027. Les attestations sont remises pendant AI-BID 2027.",
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
