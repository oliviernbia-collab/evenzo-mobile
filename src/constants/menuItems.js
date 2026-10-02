import {
  Home, Search, ShoppingCart, Heart, FileText, ShieldCheck, MessageCircle, Bell, Lock,
  Briefcase, Calendar, Image as ImageIcon, DollarSign,
} from '../components/icons';

export const CLIENT_MENU_ITEMS = [
  { href: '/client/home', label: 'Accueil', icon: Home },
  { href: '/client/search', label: 'Recherche', icon: Search },
  { href: '/client/cart', label: 'Mon panier', icon: ShoppingCart },
  { href: '/client/favorites', label: 'Favoris', icon: Heart },
  { href: '/client/quotes', label: 'Mes devis', icon: FileText },
  { href: '/client/orders', label: 'Mes commandes', icon: ShoppingCart },
  { href: '/client/escrow', label: 'Paiements sécurisés', icon: ShieldCheck },
  { href: '/client/messages', label: 'Messages', icon: MessageCircle },
  { href: '/client/notifications', label: 'Notifications', icon: Bell },
  { href: '/client/profile-edit', label: 'Mon profil', icon: Lock },
];

export const PRO_MENU_ITEMS = [
  { href: '/pro/dashboard', label: 'Tableau de bord', icon: Home },
  { href: '/pro/services', label: 'Mes services', icon: Briefcase },
  { href: '/pro/quotes', label: 'Devis reçus', icon: FileText },
  { href: '/pro/reservations', label: 'Réservations', icon: Calendar },
  { href: '/pro/portfolio', label: 'Portfolio', icon: ImageIcon },
  { href: '/pro/availability', label: 'Disponibilités', icon: Calendar },
  { href: '/pro/kyc', label: 'Vérification KYC', icon: ShieldCheck },
  { href: '/pro/subscription', label: 'Abonnement', icon: DollarSign },
  { href: '/pro/escrow', label: 'Paiements sécurisés', icon: ShieldCheck },
  { href: '/pro/messages', label: 'Messages', icon: MessageCircle },
  { href: '/pro/notifications', label: 'Notifications', icon: Bell },
  { href: '/pro/profile-edit', label: 'Mon profil', icon: Lock },
];
