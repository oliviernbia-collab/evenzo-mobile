# Evenzo — Application mobile (Expo / React Native)

Client mobile de la marketplace événementielle Evenzo (Côte d'Ivoire), consommant la même API backend que le site web (`../backend`). Stack : **Expo Router** (navigation par fichiers), **NativeWind** (Tailwind pour React Native).

## Démarrage

```bash
cd mobile
npm install
cp .env.example .env   # puis renseignez l'IP locale de votre backend (pas "localhost")
npx expo start
```

Scannez le QR code avec l'app **Expo Go** (Android/iOS), ou appuyez sur `a`/`i` pour un émulateur.

`EXPO_PUBLIC_API_URL` doit pointer vers la machine qui fait tourner `../backend` (ex: `http://192.168.1.20:3001/api`) — un téléphone physique ou un émulateur ne peut pas résoudre `localhost` comme un navigateur sur la même machine.

## Périmètre couvert

- **Client** : recherche/filtres (dont "autour de moi"), comparateur de prestataires (jusqu'à 3), profil prestataire (services, avis, portfolio, disponibilités, suggestions similaires/complémentaires, contact masqué puis appel/WhatsApp direct), devis (dont partage inline en messagerie), panier + code promo + commande (preuve de paiement Wave par prestataire), paiements sécurisés (escrow : confirmer/annuler/litige avec preuves), avis vérifiés après prestation, favoris, messagerie, notifications, tableau de bord d'activité (réservations/dépenses/devis), profil, double authentification (2FA), formulaire de contact.
- **Prestataire** : tableau de bord (stats, essai gratuit/abonnement), services (CRUD), devis reçus (répondre/décliner), réservations (accepter/refuser), portfolio, disponibilités (calendrier visuel), KYC (soumission documents), abonnement (paiement Wave manuel), paiements sécurisés (répondre aux litiges avec preuves, signaler absence client), messagerie, notifications, profil, double authentification (2FA), formulaire de contact.
- **Admin** : non disponible sur mobile par choix — un compte admin est redirigé vers un écran l'invitant à utiliser la version web.

Menu latéral coulissant (☰) dans les deux espaces pour naviguer rapidement entre toutes ces sections, en plus de la barre d'onglets.

## Simplifications volontaires (v1)

- Connexion requise pour tout utiliser (pas de navigation "invité" comme sur le web).
- Graphiques du tableau de bord simplifiés en indicateurs chiffrés (pas de mini-graphiques SVG comme sur le web).
- Inscription à la newsletter non reprise sur mobile (valeur jugée marginale hors contexte pied de page web).

## Connexion Google (optionnelle, nécessite une action de votre part)

Le code est prêt (`src/components/GoogleSignInButton.js`, flux OAuth via `expo-auth-session`) mais **le bouton reste masqué** jusqu'à ce que vous configuriez un Client ID OAuth **natif** :

1. Dans [Google Cloud Console](https://console.cloud.google.com/apis/credentials), créez un Client ID de type **iOS** et/ou **Android** (distinct du Client ID "Web application" déjà utilisé par le frontend — Google l'exige).
2. Renseignez-le dans `mobile/.env` : `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.
3. Renseignez la même valeur côté backend (`backend/.env`) : `GOOGLE_CLIENT_ID_MOBILE_IOS` / `GOOGLE_CLIENT_ID_MOBILE_ANDROID` — le backend accepte déjà plusieurs audiences valides.

Sans cette config, tout le reste de l'app fonctionne normalement ; seul ce bouton reste invisible (même comportement que le web sans `VITE_GOOGLE_CLIENT_ID`).

## Ajustement backend associé

`../backend` a été légèrement modifié pour que le refresh token (habituellement un cookie httpOnly, inadapté à React Native) soit aussi accepté/renvoyé dans le corps JSON (`POST /api/auth/login|register|refresh|logout`), sans rien changer au comportement du frontend web existant (toujours basé sur le cookie). La route Google (`/api/auth/google`) accepte désormais plusieurs Client ID valides (web + mobile natifs, voir ci-dessus).
