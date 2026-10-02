import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../../components/Screen';
import TopBar from '../../../components/TopBar';
import Banner from '../../../components/Banner';
import LoadingView from '../../../components/LoadingView';
import { Eye, DollarSign, TrendingUp, Heart, ShoppingCart, ShieldCheck } from '../../../components/icons';
import { getMyProviderStats } from '../../../api/providers';
import { getKycStatus } from '../../../api/kyc';
import { useProviderAccess } from '../../../hooks/useProviderAccess';
import { useAuth } from '../../../context/AuthContext';
import { formatFcfa } from '../../../utils/format';

function StatCard({ icon, label, value }) {
  return (
    <View className="mb-3 w-[48%] rounded-xl border border-gray-100 bg-white p-4">
      {icon}
      <Text className="mt-2 text-lg font-bold text-gray-900">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
}

export default function ProviderDashboardScreen() {
  const { user } = useAuth();
  const { status, isLocked } = useProviderAccess();
  const [kyc, setKyc] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [kycData, statsData] = await Promise.all([getKycStatus(), getMyProviderStats()]);
      setKyc(kycData);
      setStats(statsData);
    } catch { /* silencieux */ }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingView />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <TopBar title="Tableau de bord" />
      <Text className="mb-4 text-sm text-gray-500">Bonjour {user?.name?.split(' ')[0]}, voici votre activité Evenzo.</Text>

      {kyc && kyc.status !== 'approved' ? (
        <Pressable onPress={() => router.push('/pro/kyc')}>
          <Banner
            message={kyc.message || 'Complétez votre vérification KYC pour activer votre compte.'}
            tone={kyc.status === 'rejected' ? 'error' : 'warning'}
          />
        </Pressable>
      ) : null}

      {isLocked ? (
        <Pressable onPress={() => router.push('/pro/subscription')}>
          <Banner message="Votre essai gratuit est terminé. Abonnez-vous pour continuer à publier vos services." tone="error" />
        </Pressable>
      ) : status?.mode === 'trial' ? (
        <Banner
          message={`Essai gratuit en cours jusqu'au ${new Date(status.trialEndsAt).toLocaleDateString('fr-FR')}.`}
          tone="info"
        />
      ) : null}

      <View className="flex-row flex-wrap justify-between">
        <StatCard icon={<Eye size={18} color="#6b7280" />} label="Vues du profil" value={stats?.profile_views ?? 0} />
        <StatCard icon={<DollarSign size={18} color="#16a34a" />} label="Chiffre d'affaires" value={formatFcfa(stats?.total_ca)} />
        <StatCard icon={<TrendingUp size={18} color="#d97706" />} label="Revenus disponibles" value={formatFcfa(stats?.revenue_available)} />
        <StatCard icon={<ShieldCheck size={18} color="#2563eb" />} label="Revenus en attente" value={formatFcfa(stats?.revenue_pending)} />
        <StatCard icon={<ShoppingCart size={18} color="#6b7280" />} label="Commandes" value={stats?.orders_count ?? 0} />
        <StatCard icon={<Heart size={18} color="#dc2626" />} label="Favoris reçus" value={stats?.favorites_count ?? 0} />
      </View>

      {stats?.top_services?.length > 0 ? (
        <View className="mt-2 rounded-xl border border-gray-100 bg-white p-4">
          <Text className="mb-3 font-semibold text-gray-900">Services les plus demandés</Text>
          {stats.top_services.map((s) => (
            <View key={s.name} className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm text-gray-700" numberOfLines={1}>{s.name}</Text>
              <Text className="text-xs text-gray-500">{s.orders} commande(s)</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
