import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { getActivePromotions } from '../api/promotions';

function describeDiscount(p) {
  const value = p.discount_type === 'percentage' ? `-${p.discount_value}%` : `-${Number(p.discount_value).toLocaleString('fr-FR')} FCFA`;
  if (p.scope === 'category' && p.category) return `${value} sur ${p.category}`;
  if (p.scope === 'provider') return `${value} chez un prestataire sélectionné`;
  return `${value} sur toute la plateforme`;
}

/** Bannière des promotions actives (sans code) — affichée en haut de l'accueil. */
export default function PromoBanner() {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => { getActivePromotions().then(setPromotions).catch(() => {}); }, []);

  if (promotions.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
      <View className="flex-row gap-2">
        {promotions.map((p) => (
          <View key={p.id} className="w-64 rounded-xl bg-amber-600 px-4 py-3">
            <Text className="text-sm font-bold text-white" numberOfLines={1}>{p.label}</Text>
            <Text className="mt-0.5 text-xs text-amber-50" numberOfLines={1}>{describeDiscount(p)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
