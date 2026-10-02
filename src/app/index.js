import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import LoadingView from '../components/LoadingView';

// Point d'entrée "/" : redirige selon l'état de connexion et le rôle. Les
// arborescences client/prestataire vivent sous des segments réels distincts
// (/client/*, /pro/*) plutôt que des groupes partageant "/", pour éviter
// toute route dupliquée dans Expo Router.
export default function Index() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) return <LoadingView />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user.role === 'provider') return <Redirect href="/pro/dashboard" />;
  if (user.role === 'admin') return <Redirect href="/admin-unsupported" />;
  return <Redirect href="/client/home" />;
}
