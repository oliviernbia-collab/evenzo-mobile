// Repris de frontend/src/config/categories.js pour rester cohérent avec les
// catégories utilisées à l'inscription prestataire et dans les filtres web.
export const EVENT_CATEGORIES = [
  'Photographes', 'Traiteurs', 'DJ & Sonorisation', 'Décorateurs & Scénographie',
  'Lieux & Salles de Réception', 'Animation & Spectacles', 'Vidéastes & Drone 4K',
  'Coiffure & Beauté Mariée',
];

export const ABIDJAN_COMMUNES = [
  'Cocody', 'Plateau', 'Marcory', 'Yopougon', 'Deux-Plateaux',
  'Riviera (3, 4, Golf, Palmeraie)', 'Treichville', 'Port-Bouët', 'Koumassi',
  'Abobo', 'Adjamé', 'Attécoubé', 'Anyama', 'Bingerville', 'Songon',
];

export const INTERIOR_REGIONS = [
  'Grand-Bassam', 'Assinie-Mafia', 'Yamoussoukro', 'Bouaké', 'San-Pédro',
  'Korhogo', 'Daloa', 'Man',
];

export const PRICE_RANGES = [
  { label: 'Tous les prix', min: 0, max: 10000000 },
  { label: 'Moins de 100 000 FCFA', min: 0, max: 100000 },
  { label: '100 000 - 300 000 FCFA', min: 100000, max: 300000 },
  { label: '300 000 - 600 000 FCFA', min: 300000, max: 600000 },
  { label: '600 000 - 1 500 000 FCFA', min: 600000, max: 1500000 },
  { label: 'Plus de 1 500 000 FCFA', min: 1500000, max: 10000000 },
];
