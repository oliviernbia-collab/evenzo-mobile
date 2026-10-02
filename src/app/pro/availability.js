import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Banner from '../../components/Banner';
import MonthCalendar from '../../components/MonthCalendar';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { ArrowLeft, Calendar, X } from '../../components/icons';
import { getMyAvailability, blockAvailabilityDate, unblockAvailabilityDate } from '../../api/providers';
import { formatDate } from '../../utils/format';

export default function ProviderAvailabilityScreen() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyDate, setBusyDate] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyAvailability();
      setDates(data.map((d) => String(d).slice(0, 10)));
    } catch {
      setDates([]);
    }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const toggleDate = async (dateStr) => {
    setError('');
    setBusyDate(dateStr);
    try {
      if (dates.includes(dateStr)) {
        await unblockAvailabilityDate(dateStr);
        setDates((prev) => prev.filter((d) => d !== dateStr));
      } else {
        await blockAvailabilityDate(dateStr);
        setDates((prev) => [...prev, dateStr]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyDate(null);
    }
  };

  if (loading) return <LoadingView />;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <Text className="mb-4 text-xl font-bold text-gray-900">Disponibilités</Text>
      <Text className="mb-4 text-sm text-gray-500">
        Appuyez sur une date pour la bloquer ou la débloquer — elle sera visible sur votre profil public.
      </Text>

      <Banner message={error} tone="error" />

      <View className="mb-5">
        <MonthCalendar markedDates={dates} onDayPress={toggleDate} />
      </View>

      <Text className="mb-3 text-sm font-semibold text-gray-700">Dates bloquées</Text>
      {dates.length === 0 ? (
        <EmptyState icon={<Calendar size={40} color="#9ca3af" />} title="Aucune date bloquée" />
      ) : dates.sort().map((d) => (
        <View key={d} className="mb-2 flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
          <Text className="text-sm font-medium text-gray-800">{formatDate(d)}</Text>
          <Pressable onPress={() => toggleDate(d)} disabled={busyDate === d}>
            <X size={16} color="#dc2626" />
          </Pressable>
        </View>
      ))}
    </Screen>
  );
}
