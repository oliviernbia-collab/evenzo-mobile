import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import ReviewModal from '../../components/ReviewModal';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { ArrowLeft, ShoppingCart, Star } from '../../components/icons';
import { getMyOrders } from '../../api/orders';
import { formatFcfa, formatDate } from '../../utils/format';

function statusInfo(order) {
  if (order.status === 'pending_payment') return { label: 'Paiement en vérification', tone: 'amber' };
  if (order.status === 'rejected') return { label: 'Paiement rejeté', tone: 'red' };
  if (order.status === 'confirmed' && order.provider_response === 'pending') return { label: 'Confirmée — en attente du prestataire', tone: 'blue' };
  if (order.status === 'confirmed' && order.provider_response === 'accepted') return { label: 'Acceptée par le prestataire', tone: 'green' };
  if (order.status === 'confirmed' && order.provider_response === 'declined') return { label: 'Refusée par le prestataire', tone: 'red' };
  return { label: order.status, tone: 'gray' };
}

export default function ClientOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [confirmation, setConfirmation] = useState('');

  const load = useCallback(async () => {
    try { setOrders(await getMyOrders()); } catch { setOrders([]); }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingView />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <Text className="mb-4 text-xl font-bold text-gray-900">Mes commandes</Text>

      <Banner message={confirmation} tone="success" />

      {orders.length === 0 ? (
        <EmptyState icon={<ShoppingCart size={40} color="#9ca3af" />} title="Aucune commande" />
      ) : orders.map((o) => {
        const info = statusInfo(o);
        return (
          <View key={o.id} className="mb-3 rounded-xl border border-gray-100 bg-white p-4">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="font-semibold text-gray-900">{o.order_reference}</Text>
              <Badge label={info.label} tone={info.tone} />
            </View>
            <Text className="text-sm text-gray-600">{o.provider_name}</Text>
            {(o.items || []).map((it) => (
              <Text key={it.id} className="mt-1 text-xs text-gray-500">{it.quantity}× {it.service_name}</Text>
            ))}
            <View className="mt-2 flex-row items-center justify-between border-t border-gray-50 pt-2">
              <Text className="text-xs text-gray-400">{formatDate(o.created_at)}</Text>
              <Text className="font-bold text-amber-700">{formatFcfa(o.total_fcfa)}</Text>
            </View>

            {o.status === 'confirmed' ? (
              <Button
                title="Laisser un avis"
                variant="secondary"
                icon={<Star size={14} color="#92400e" />}
                onPress={() => setReviewTarget(o)}
                className="mt-3 py-2"
              />
            ) : null}
          </View>
        );
      })}

      <ReviewModal
        visible={!!reviewTarget}
        providerId={reviewTarget?.provider_id}
        providerName={reviewTarget?.provider_name}
        onClose={() => setReviewTarget(null)}
        onSubmitted={() => {
          setReviewTarget(null);
          setConfirmation('Merci, votre avis a été publié.');
          setTimeout(() => setConfirmation(''), 3000);
        }}
      />
    </Screen>
  );
}
