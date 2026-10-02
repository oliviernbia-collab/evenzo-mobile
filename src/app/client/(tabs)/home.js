import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../../components/Screen';
import Input from '../../../components/Input';
import ProviderCard from '../../../components/ProviderCard';
import PromoBanner from '../../../components/PromoBanner';
import LoadingView from '../../../components/LoadingView';
import Logo from '../../../components/Logo';
import { Menu, Bell, Receipt, Wallet, FileText, CheckCircle, MessageCircle, Heart } from '../../../components/icons';
import { getProviders } from '../../../api/providers';
import { getMyOrders } from '../../../api/orders';
import { getMyQuotes } from '../../../api/quotes';
import { getConversations } from '../../../api/messages';
import { useFavorites } from '../../../hooks/useFavorites';
import { useAuth } from '../../../context/AuthContext';
import { useSlidingMenu } from '../../../context/SlidingMenuContext';
import { EVENT_CATEGORIES } from '../../../constants/categories';
import { formatFcfa } from '../../../utils/format';

function StatCard({ icon, label, value }) {
  return (
    <View className="mb-3 w-[31%] items-center rounded-xl border border-gray-100 bg-white px-2 py-3">
      {icon}
      <Text className="mt-1.5 text-sm font-bold text-gray-900" numberOfLines={1}>{value}</Text>
      <Text className="text-center text-[10px] text-gray-500" numberOfLines={2}>{label}</Text>
    </View>
  );
}

export default function ClientHomeScreen() {
  const { user } = useAuth();
  const { open } = useSlidingMenu();
  const { favoriteIds, toggle } = useFavorites();
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const [providersData, orders, quotes, conversations] = await Promise.all([
        getProviders({}),
        getMyOrders().catch(() => []),
        getMyQuotes().catch(() => []),
        getConversations().catch(() => []),
      ]);
      setProviders(providersData.slice(0, 10));
      const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
      setStats({
        reservations: confirmedOrders.length,
        totalSpent: confirmedOrders.reduce((sum, o) => sum + (Number(o.total_fcfa) || 0), 0),
        quotesSent: quotes.length,
        quotesAccepted: quotes.filter((q) => q.status === 'accepted').length,
        activeConversations: conversations.length,
      });
    } catch {
      setProviders([]);
    }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const goSearch = (params) => router.push({ pathname: '/client/search', params });

  if (loading) return <LoadingView label="Chargement..." />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-3">
          <Pressable onPress={open} className="h-10 w-10 items-center justify-center rounded-full bg-white">
            <Menu size={20} />
          </Pressable>
          <View className="flex-1 flex-row items-center gap-2">
            <Logo size={36} />
            <View>
              <Text className="text-xs text-gray-500">Bonjour{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Text>
              <Text className="text-base font-bold text-gray-900">Votre activité Evenzo</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={() => router.push('/client/notifications')} className="h-10 w-10 items-center justify-center rounded-full bg-white">
          <Bell size={20} />
        </Pressable>
      </View>

      <PromoBanner />

      <View className="mb-6 flex-row flex-wrap justify-between">
        <StatCard icon={<Receipt size={18} color="#92400e" />} label="Réservations" value={stats?.reservations ?? 0} />
        <StatCard icon={<Wallet size={18} color="#16a34a" />} label="Dépenses" value={formatFcfa(stats?.totalSpent)} />
        <StatCard icon={<FileText size={18} color="#374151" />} label="Devis envoyés" value={stats?.quotesSent ?? 0} />
        <StatCard icon={<CheckCircle size={18} color="#0d9488" />} label="Devis acceptés" value={stats?.quotesAccepted ?? 0} />
        <StatCard icon={<MessageCircle size={18} color="#0369a1" />} label="Messages actifs" value={stats?.activeConversations ?? 0} />
        <StatCard icon={<Heart size={18} color="#e11d48" />} label="Favoris" value={favoriteIds.length} />
      </View>

      <Pressable onPress={() => goSearch({})}>
        <View pointerEvents="none">
          <Input
            placeholder="DJ, traiteur, photographe..."
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </Pressable>

      <Text className="mb-3 text-base font-bold text-gray-900">Catégories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        <View className="flex-row gap-2">
          {EVENT_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => goSearch({ category: cat })}
              className="rounded-full border border-gray-200 bg-white px-4 py-2"
            >
              <Text className="text-sm font-medium text-gray-700">{cat}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-bold text-gray-900">Prestataires recommandés</Text>
        <Pressable onPress={() => goSearch({})}>
          <Text className="text-sm font-semibold text-amber-700">Tout voir</Text>
        </Pressable>
      </View>

      {providers.map((p) => (
        <ProviderCard
          key={p.id}
          provider={p}
          basePath="/client"
          isFavorite={favoriteIds.includes(String(p.id))}
          onToggleFavorite={toggle}
        />
      ))}
    </Screen>
  );
}
