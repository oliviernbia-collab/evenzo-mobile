import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import Button from '../../components/Button';
import { ArrowLeft, Bell } from '../../components/icons';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/notifications';
import { formatRelativeTime } from '../../utils/format';

export default function ClientNotificationsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await getNotifications()); } catch { setItems([]); }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const openNotification = async (n) => {
    if (!n.is_read) {
      setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, is_read: true } : it)));
      markNotificationRead(n.id).catch(() => {});
    }
  };

  const markAll = async () => {
    setItems((prev) => prev.map((it) => ({ ...it, is_read: true })));
    markAllNotificationsRead().catch(() => {});
  };

  if (loading) return <LoadingView />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-2">
          <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
        </Pressable>
        {items.some((n) => !n.is_read) ? (
          <Pressable onPress={markAll}><Text className="text-sm font-semibold text-amber-700">Tout marquer lu</Text></Pressable>
        ) : null}
      </View>
      <Text className="mb-4 text-xl font-bold text-gray-900">Notifications</Text>

      {items.length === 0 ? (
        <EmptyState icon={<Bell size={40} color="#9ca3af" />} title="Aucune notification" />
      ) : items.map((n) => (
        <Pressable
          key={n.id}
          onPress={() => openNotification(n)}
          className={`mb-2 rounded-xl border p-3.5 ${n.is_read ? 'border-gray-100 bg-white' : 'border-amber-200 bg-amber-50'}`}
        >
          <Text className="font-semibold text-gray-900">{n.title}</Text>
          <Text className="mt-1 text-sm text-gray-600">{n.message}</Text>
          <Text className="mt-1 text-xs text-gray-400">{formatRelativeTime(n.created_at)}</Text>
        </Pressable>
      ))}
    </Screen>
  );
}
