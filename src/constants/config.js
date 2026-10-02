// En développement, le simulateur/émulateur ne peut pas joindre "localhost"
// (qui pointerait vers le téléphone lui-même) : il faut l'IP locale de la
// machine qui fait tourner le backend (ex: 192.168.1.20). Définissez
// EXPO_PUBLIC_API_URL dans mobile/.env pour la remplacer (voir .env.example).
const DEFAULT_DEV_API_URL = 'http://localhost:3001/api';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_DEV_API_URL;

export const BRAND = {
  name: 'Evenzo',
  whatsappCountryCode: '225',
};
