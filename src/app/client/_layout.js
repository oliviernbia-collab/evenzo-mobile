import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SlidingMenuProvider } from '../../context/SlidingMenuContext';
import { ComparisonProvider } from '../../context/ComparisonContext';
import SlidingMenu from '../../components/SlidingMenu';
import ComparisonBar from '../../components/ComparisonBar';
import LoadingView from '../../components/LoadingView';
import { CLIENT_MENU_ITEMS } from '../../constants/menuItems';

export default function ClientLayout() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) return <LoadingView />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  if (user.role !== 'client') return <Redirect href="/" />;

  return (
    <SlidingMenuProvider>
      <ComparisonProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <SlidingMenu items={CLIENT_MENU_ITEMS} />
        <ComparisonBar />
      </ComparisonProvider>
    </SlidingMenuProvider>
  );
}
