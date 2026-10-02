import { useState, useEffect, useCallback } from 'react';
import { View, FlatList } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../../components/Screen';
import TopBar from '../../../components/TopBar';
import ProviderCard from '../../../components/ProviderCard';
import EmptyState from '../../../components/EmptyState';
import LoadingView from '../../../components/LoadingView';
import { Heart } from '../../../components/icons';
import { getProviders } from '../../../api/providers';
import { useFavorites } from '../../../hooks/useFavorites';

export default function FavoritesScreen() {
  const { favoriteIds, toggle, reload } = useFavorites();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const all = await getProviders({});
      setProviders(all);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); load(); }, []);

  if (loading) return <LoadingView />;

  const favorites = providers.filter((p) => favoriteIds.includes(String(p.id)));

  return (
    <Screen scroll={false}>
      <View className="px-4 pt-4"><TopBar title="Favoris" /></View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <ProviderCard provider={item} basePath="/client" isFavorite onToggleFavorite={toggle} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Heart size={40} color="#9ca3af" />}
            title="Aucun favori"
            description="Ajoutez des prestataires à vos favoris pour les retrouver facilement."
            actionLabel="Découvrir des prestataires"
            onAction={() => router.push('/client/search')}
          />
        }
      />
    </Screen>
  );
}
