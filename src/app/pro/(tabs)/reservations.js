import { useState, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import Screen from '../../../components/Screen';
import TopBar from '../../../components/TopBar';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import EmptyState from '../../../components/EmptyState';
import LoadingView from '../../../components/LoadingView';
import { Calendar } from '../../../components/icons';
import { getMyOrders, respondToOrder } from '../../../api/orders';
import { formatFcfa, formatDate } from '../../../utils/format';

export default function ProviderReservationsScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try { setOrders(await getMyOrders()); } catch { setOrders([]); }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const respond = async (order, response) => {
    setBusyId(order.id);
    try { await respondToOrder(order.id, response); await load(); } finally { setBusyId(null); }
  };

  if (loading) return <LoadingView />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <TopBar title="Réservations" />

      {orders.length === 0 ? (
        <EmptyState icon={<Calendar size={40} color="#9ca3af" />} title="Aucune réservation" />
      ) : orders.map((o) => (
        <View key={o.id} className="mb-3 rounded-xl border border-gray-100 bg-white p-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-semibold text-gray-900">{o.order_reference}</Text>
            <Badge
              label={o.status === 'pending_payment' ? 'Paiement en vérification' : o.provider_response === 'pending' ? 'À confirmer' : o.provider_response === 'accepted' ? 'Acceptée' : 'Refusée'}
              tone={o.status === 'pending_payment' ? 'amber' : o.provider_response === 'accepted' ? 'green' : o.provider_response === 'declined' ? 'red' : 'blue'}
            />
          </View>
          <Text className="text-sm text-gray-600">{o.customer_name} · {o.customer_phone}</Text>
          {(o.items || []).map((it) => (
            <Text key={it.id} className="mt-1 text-xs text-gray-500">{it.quantity}× {it.service_name}</Text>
          ))}
          <Text className="mt-2 font-bold text-amber-700">{formatFcfa(o.total_fcfa)}</Text>
          <Text className="mt-1 text-xs text-gray-400">{formatDate(o.created_at)}</Text>

          {o.status === 'confirmed' && o.provider_response === 'pending' ? (
            <View className="mt-3 flex-row gap-2">
              <Button title="Refuser" variant="secondary" onPress={() => respond(o, 'declined')} loading={busyId === o.id} className="flex-1 py-2" />
              <Button title="Accepter" onPress={() => respond(o, 'accepted')} loading={busyId === o.id} className="flex-1 py-2" />
            </View>
          ) : null}
        </View>
      ))}
    </Screen>
  );
}
