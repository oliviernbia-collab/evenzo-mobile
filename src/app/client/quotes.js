import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { ArrowLeft, FileText } from '../../components/icons';
import { getMyQuotes, updateQuoteStatus } from '../../api/quotes';
import { formatFcfa, formatDate } from '../../utils/format';

const STATUS_TONE = {
  pending: 'gray', quoted: 'blue', accepted: 'green', rejected: 'red', modification_requested: 'amber',
};
const STATUS_LABEL = {
  pending: 'En attente', quoted: 'Devis reçu', accepted: 'Accepté', rejected: 'Refusé', modification_requested: 'Modification demandée',
};

export default function ClientQuotesScreen() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try { setQuotes(await getMyQuotes()); } catch { setQuotes([]); }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const respond = async (quote, status) => {
    setBusyId(quote.id);
    try { await updateQuoteStatus(quote.id, status); await load(); } finally { setBusyId(null); }
  };

  if (loading) return <LoadingView />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <Text className="mb-4 text-xl font-bold text-gray-900">Mes devis</Text>

      {quotes.length === 0 ? (
        <EmptyState icon={<FileText size={40} color="#9ca3af" />} title="Aucune demande de devis" />
      ) : quotes.map((q) => (
        <View key={q.id} className="mb-3 rounded-xl border border-gray-100 bg-white p-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-semibold text-gray-900">{q.provider_name}</Text>
            <Badge label={STATUS_LABEL[q.status] || q.status} tone={STATUS_TONE[q.status] || 'gray'} />
          </View>
          <Text className="text-sm text-gray-600">{q.service_name}</Text>
          {q.event_date ? <Text className="text-xs text-gray-400">Pour le {q.event_date}</Text> : null}

          {q.status === 'quoted' ? (
            <View className="mt-3 rounded-lg bg-amber-50 p-3">
              <Text className="font-bold text-amber-800">{formatFcfa(q.quoted_price)}</Text>
              {q.quoted_conditions ? <Text className="mt-1 text-xs text-amber-700">{q.quoted_conditions}</Text> : null}
              {q.quoted_validity_days ? <Text className="mt-1 text-xs text-amber-600">Valable {q.quoted_validity_days} jours</Text> : null}
              <View className="mt-3 flex-row gap-2">
                <Button title="Refuser" variant="secondary" onPress={() => respond(q, 'rejected')} loading={busyId === q.id} className="flex-1 py-2" />
                <Button title="Accepter" onPress={() => respond(q, 'accepted')} loading={busyId === q.id} className="flex-1 py-2" />
              </View>
            </View>
          ) : null}

          {q.status === 'accepted' ? (
            <Button
              title="Payer un acompte sécurisé"
              onPress={() => router.push({ pathname: '/client/escrow', params: { quoteId: q.id, providerId: q.provider_id, amount: q.quoted_price, providerName: q.provider_name } })}
              className="mt-3 py-2.5"
            />
          ) : null}

          <Text className="mt-2 text-xs text-gray-400">Demandé le {formatDate(q.created_at)}</Text>
        </View>
      ))}
    </Screen>
  );
}
