import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useComparison } from '../context/ComparisonContext';
import { X } from './icons';
import { CARD_SHADOW } from '../constants/styles';

/** Barre flottante "Comparer (N)" affichée dès qu'au moins 2 prestataires sont sélectionnés. */
export default function ComparisonBar() {
  const { selectedIds, clear } = useComparison();
  if (selectedIds.length < 2) return null;

  return (
    <View className="absolute bottom-20 left-4 right-4 flex-row items-center justify-between rounded-2xl bg-gray-900 px-4 py-3" style={CARD_SHADOW}>
      <Text className="flex-1 text-sm font-medium text-white" numberOfLines={1}>
        {selectedIds.map((p) => p.name).join(', ')}
      </Text>
      <Pressable onPress={clear} className="mr-3 h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
        <X size={14} color="#fff" />
      </Pressable>
      <Pressable onPress={() => router.push('/client/compare')} className="rounded-full bg-amber-600 px-4 py-2">
        <Text className="text-xs font-bold text-white">Comparer ({selectedIds.length})</Text>
      </Pressable>
    </View>
  );
}
