import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../../components/Screen';
import TopBar from '../../../components/TopBar';
import Button from '../../../components/Button';
import EmptyState from '../../../components/EmptyState';
import LoadingView from '../../../components/LoadingView';
import { Briefcase, Edit, Trash, Plus } from '../../../components/icons';
import { getServicesForProvider, deleteService } from '../../../api/services';
import { useAuth } from '../../../context/AuthContext';
import { formatFcfa } from '../../../utils/format';

export default function ProviderServicesScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setServices(await getServicesForProvider(user.id)); } catch { setServices([]); }
  }, [user.id]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const confirmDelete = (service) => {
    Alert.alert('Supprimer ce service ?', service.name, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await deleteService(service.id); load(); } },
    ]);
  };

  if (loading) return <LoadingView />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <TopBar
        title="Mes services"
        right={
          <Pressable onPress={() => router.push('/pro/services/new')} className="h-9 w-9 items-center justify-center rounded-full bg-amber-600">
            <Plus size={18} color="#fff" />
          </Pressable>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={40} color="#9ca3af" />}
          title="Aucun service publié"
          actionLabel="Ajouter un service"
          onAction={() => router.push('/pro/services/new')}
        />
      ) : services.map((s) => (
        <View key={s.id} className="mb-3 rounded-xl border border-gray-100 bg-white p-4">
          <Text className="font-semibold text-gray-900">{s.name}</Text>
          {s.description ? <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>{s.description}</Text> : null}
          <Text className="mt-1 font-bold text-amber-700">{formatFcfa(s.price)}</Text>
          <View className="mt-3 flex-row gap-2">
            <Button
              title="Modifier"
              variant="secondary"
              icon={<Edit size={14} color="#92400e" />}
              onPress={() => router.push({
                pathname: `/pro/services/${s.id}`,
                params: { name: s.name, description: s.description || '', price: String(s.price), cancellation_policy: s.cancellation_policy || 'moderate' },
              })}
              className="flex-1 py-2"
            />
            <Button title="Supprimer" variant="secondary" icon={<Trash size={14} color="#dc2626" />} onPress={() => confirmDelete(s)} className="flex-1 py-2" />
          </View>
        </View>
      ))}
    </Screen>
  );
}
