# AI-BID 2027 — site & billetterie

Next.js 16 (App Router, Tailwind v4) · Supabase (projet dédié) · FedaPay · Resend. Déployé sur Vercel, domaine `ai-bidder.com`.

## Pages

| Route | Rôle |
|---|---|
| `/` | Landing : hero, thème, programme, billets, livre, infos pratiques/FAQ, organisateur |
| `/commande?pro=2&premium=1` | Coordonnées + nom de chaque participant → paiement FedaPay |
| `/commande/[id]?t=…` | Retour de paiement : vérifie FedaPay, affiche les billets (QR), PDF, impression |
| `/admin` | Contrôle à l'entrée : scan QR caméra / saisie manuelle, compteurs (mot de passe) |

## API

- `POST /api/orders` — crée la commande + billets (prix recalculés serveur), ouvre la transaction FedaPay.
- `GET /api/orders/[id]?t=` — état ; re-vérifie la transaction auprès de FedaPay tant qu'elle est en attente.
- `GET /api/orders/[id]/pdf?t=` — PDF : un billet par page + reçu récapitulatif.
- `POST /api/fedapay/webhook` — signature `X-FEDAPAY-SIGNATURE` vérifiée, statut re-vérifié via l'API.
- `POST /api/admin/checkin`, `GET /api/admin/stats`, `POST|DELETE /api/admin/session`.

Paiement confirmé = transition `pending → paid` atomique (webhook et page de retour peuvent tourner en parallèle, un seul gagne) puis envoi unique de l'email avec le PDF.
Chaque QR contient `code.signature` (HMAC `TICKET_SECRET`) : un QR fabriqué est rejeté, un billet déjà scanné est signalé.

## Mise en route

1. **Supabase** : exécuter `supabase/migrations/0001_init.sql` dans l'éditeur SQL.
2. **Variables** : `cp .env.example .env.local` puis remplir (voir commentaires). Générer `TICKET_SECRET` avec `openssl rand -base64 32`.
3. **FedaPay** : webhook vers `https://ai-bidder.com/api/fedapay/webhook` (événements `transaction.*`), copier le secret.
4. **Resend** : vérifier le domaine `ai-bidder.com` pour envoyer depuis `billets@ai-bidder.com`.
5. `npm install && npm run dev -- -p 3300`

PDF d'exemple sans base ni paiement : `npx tsx --conditions=react-server scripts/render-sample-pdf.mts exemple.pdf`

## Contenu à mettre à jour

Tout est dans `src/lib/event.ts` (lieu, horaires, programme, formules, FAQ) : site, PDF et email lisent ce fichier.
Lieu, horaires et programme sont **provisoires**.
