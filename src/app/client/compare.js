import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Avatar from '../../components/Avatar';
import StarRating from '../../components/StarRating';
import Badge from '../../components/Badge';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import { ArrowLeft, Layers } from '../../components/icons';
import { getProviderById } from '../../api/providers';
import { useComparison } from '../../context/ComparisonContext';
import { formatFcfa } from '../../utils/format';

const ROWS = [
  { key: 'category', label: 'Catégorie' },
  { key: 'commune', label: 'Commune' },
  { key: 'starting_price', label: 'Prix de départ', format: (v) => (v ? formatFcfa(v) : '—') },
  { key: 'response_time', label: 'Temps de réponse' },
  { key: 'years_experience', label: "Années d'expérience" },
];

export default function CompareScreen() {
  const { selectedIds, clear } = useComparison();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(selectedIds.map((p) => getProviderById(p.id).catch(() => null)))
      .then((results) => setProviders(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingView />;

  return (
    <Screen scroll={false}>
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-2">
          <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
        </Pressable>
        <Pressable onPress={() => { clear(); router.back(); }}>
          <Text className="text-sm font-semibold text-red-600">Effacer</Text>
        </Pressable>
      </View>

      {providers.length === 0 ? (
        <EmptyState icon={<Layers size={40} color="#9ca3af" />} title="Aucun prestataire à comparer" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View className="flex-row">
              <View className="w-28" />
              {providers.map((p) => (
                <Pressable key={p.id} onPress={() => router.push(`/client/provider/${p.id}`)} className="w-40 items-center px-2 pb-3">
                  <Avatar uri={p.avatar} name={p.name} size="lg" />
                  <Text className="mt-2 text-center text-sm font-bold text-gray-900" numberOfLines={1}>{p.name}</Text>
                  {p.kyc_badge ? <Badge label="Vérifié" tone="green" /> : null}
                  <View className="mt-1"><StarRating rating={p.rating} reviewCount={p.review_count} /></View>
                </Pressable>
              ))}
            </View>

            {ROWS.map((row) => (
              <View key={row.key} className="flex-row border-t border-gray-100">
                <View className="w-28 justify-center py-3">
                  <Text className="text-xs font-semibold text-gray-500">{row.label}</Text>
                </View>
                {providers.map((p) => (
                  <View key={p.id} className="w-40 justify-center border-l border-gray-100 px-2 py-3">
                    <Text className="text-center text-sm text-gray-800" numberOfLines={2}>
                      {row.format ? row.format(p[row.key]) : (p[row.key] || '—')}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
