import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SlidingMenuProvider } from '../../context/SlidingMenuContext';
import SlidingMenu from '../../components/SlidingMenu';
import LoadingView from '../../components/LoadingView';
import { PRO_MENU_ITEMS } from '../../constants/menuItems';

export default function ProLayout() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) return <LoadingView />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user.role !== 'provider') return <Redirect href="/" />;

  return (
    <SlidingMenuProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <SlidingMenu items={PRO_MENU_ITEMS} />
    </SlidingMenuProvider>
  );
}
