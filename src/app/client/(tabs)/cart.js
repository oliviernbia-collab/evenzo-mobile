import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../../components/Screen';
import TopBar from '../../../components/TopBar';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Banner from '../../../components/Banner';
import EmptyState from '../../../components/EmptyState';
import LoadingView from '../../../components/LoadingView';
import { ShoppingCart, Plus, X, Tag } from '../../../components/icons';
import { getCart, updateCartItem, removeCartItem, calculateCartTotals } from '../../../api/cart';
import { validatePromoCode } from '../../../api/promotions';
import { formatFcfa } from '../../../utils/format';

export default function CartScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getCart();
      setItems(data);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const changeQty = async (item, delta) => {
    const newQty = Math.max(1, (item.quantity || 1) + delta);
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, quantity: newQty } : it)));
    try { await updateCartItem(item.id, { quantity: newQty }); } catch { load(); }
  };

  const remove = async (item) => {
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    try { await removeCartItem(item.id); } catch { load(); }
  };

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError('');
    setApplyingPromo(true);
    try {
      const promoItems = items.map((it) => ({
        price: it.service_price, quantity: it.quantity, category: it.provider_category, providerId: it.provider_id,
      }));
      const data = await validatePromoCode(promoInput.trim(), promoItems);
      setPromo(data);
    } catch (err) {
      setPromo(null);
      setPromoError(err.message);
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromo = () => { setPromo(null); setPromoInput(''); setPromoError(''); };

  const goCheckout = () => router.push({ pathname: '/client/checkout', params: promo ? { promoCode: promo.code } : {} });

  if (loading) return <LoadingView />;

  if (items.length === 0) {
    return (
      <Screen>
        <TopBar title="Mon panier" />
        <EmptyState
          icon={<ShoppingCart size={40} color="#9ca3af" />}
          title="Votre panier est vide"
          description="Parcourez les prestataires pour ajouter des prestations."
          actionLabel="Découvrir des prestataires"
          onAction={() => router.push('/client/search')}
        />
      </Screen>
    );
  }

  const totals = calculateCartTotals(items, promo?.discount_amount || 0);
  const byProvider = items.reduce((acc, it) => {
    (acc[it.provider_id] = acc[it.provider_id] || { name: it.provider_name, items: [] }).items.push(it);
    return acc;
  }, {});

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <TopBar title="Mon panier" />

      {Object.entries(byProvider).map(([providerId, group]) => (
        <View key={providerId} className="mb-4 rounded-xl border border-gray-100 bg-white p-3">
          <Text className="mb-2 font-semibold text-gray-900">{group.name}</Text>
          {group.items.map((item) => (
            <View key={item.id} className="mb-2 flex-row items-center justify-between border-b border-gray-50 pb-2">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>{item.service_name}</Text>
                <Text className="text-xs text-gray-500">{formatFcfa(item.service_price)} / unité</Text>
                {item.event_date ? <Text className="text-xs text-gray-400">Pour le {item.event_date}</Text> : null}
              </View>
              <View className="flex-row items-center gap-2">
                <Pressable onPress={() => changeQty(item, -1)} className="h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                  <Text className="text-base text-gray-700">−</Text>
                </Pressable>
                <Text className="w-6 text-center text-sm font-medium">{item.quantity}</Text>
                <Pressable onPress={() => changeQty(item, 1)} className="h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                  <Plus size={14} />
                </Pressable>
                <Pressable onPress={() => remove(item)} className="ml-1">
                  <X size={16} color="#dc2626" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ))}

      <View className="mb-4 rounded-xl border border-gray-100 bg-white p-4">
        <Text className="mb-2 text-sm font-semibold text-gray-700">Code promo</Text>
        <Banner message={promoError} tone="error" />
        {promo ? (
          <View className="flex-row items-center justify-between rounded-lg bg-green-50 px-3 py-2">
            <View className="flex-row items-center gap-2">
              <Tag size={14} color="#16a34a" />
              <Text className="text-sm font-semibold text-green-800">{promo.code} — {formatFcfa(promo.discount_amount)} de réduction</Text>
            </View>
            <Pressable onPress={removePromo}><X size={16} color="#16a34a" /></Pressable>
          </View>
        ) : (
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Input value={promoInput} onChangeText={setPromoInput} placeholder="Entrez un code" autoCapitalize="characters" containerClassName="mb-0" />
            </View>
            <Button title="Appliquer" variant="secondary" onPress={applyPromo} loading={applyingPromo} className="px-5" />
          </View>
        )}
      </View>

      <View className="mb-6 rounded-xl border border-gray-100 bg-white p-4">
        <View className="mb-1 flex-row justify-between">
          <Text className="text-sm text-gray-500">Sous-total</Text>
          <Text className="text-sm text-gray-800">{formatFcfa(totals.subtotal)}</Text>
        </View>
        <View className="mb-1 flex-row justify-between">
          <Text className="text-sm text-gray-500">Frais de séquestre (5%)</Text>
          <Text className="text-sm text-gray-800">{formatFcfa(totals.escrowFee)}</Text>
        </View>
        {totals.discountAmount > 0 ? (
          <View className="mb-1 flex-row justify-between">
            <Text className="text-sm text-green-600">Réduction</Text>
            <Text className="text-sm text-green-600">−{formatFcfa(totals.discountAmount)}</Text>
          </View>
        ) : null}
        <View className="mt-2 flex-row justify-between border-t border-gray-100 pt-2">
          <Text className="font-bold text-gray-900">Total</Text>
          <Text className="font-bold text-amber-700">{formatFcfa(totals.total)}</Text>
        </View>
      </View>

      <Button title="Passer la commande" onPress={goCheckout} />
    </Screen>
  );
}
