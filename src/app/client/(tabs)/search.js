import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import Screen from '../../../components/Screen';
import TopBar from '../../../components/TopBar';
import Input from '../../../components/Input';
import Banner from '../../../components/Banner';
import ProviderCard from '../../../components/ProviderCard';
import LoadingView from '../../../components/LoadingView';
import EmptyState from '../../../components/EmptyState';
import { Search as SearchIcon, Sliders, Navigation } from '../../../components/icons';
import { getProviders } from '../../../api/providers';
import { useFavorites } from '../../../hooks/useFavorites';
import { useComparison } from '../../../context/ComparisonContext';
import { haversineDistanceKm } from '../../../utils/geo';
import { EVENT_CATEGORIES, ABIDJAN_COMMUNES, PRICE_RANGES } from '../../../constants/categories';

const SORTS = [
  { value: 'rating', label: 'Mieux notés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'recent', label: 'Nouveautés' },
];

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const { favoriteIds, toggle } = useFavorites();
  const { isSelected, toggle: toggleCompare } = useComparison();
  const [query, setQuery] = useState(params.q || '');
  const [category, setCategory] = useState(params.category || 'Tous');
  const [commune, setCommune] = useState('');
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [sort, setSort] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myLocation, setMyLocation] = useState(null);
  const [locatingMe, setLocatingMe] = useState(false);
  const [locationError, setLocationError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProviders({ category, q: query });
      setAll(data);
    } catch {
      setAll([]);
    } finally {
      setLoading(false);
    }
  }, [category, query]);

  useEffect(() => { load(); }, [load]);

  const handleNearMe = async () => {
    if (myLocation) { setMyLocation(null); setSort('rating'); return; }
    setLocationError('');
    setLocatingMe(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Autorisation de localisation refusée.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setMyLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setSort('distance');
    } catch {
      setLocationError('Impossible de récupérer votre position.');
    } finally {
      setLocatingMe(false);
    }
  };

  const results = useMemo(() => {
    let list = [...all];
    if (commune) list = list.filter((p) => p.commune === commune);
    list = list.filter((p) => {
      const price = Number(p.starting_price) || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });
    if (sort === 'distance' && myLocation) {
      list = list
        .map((p) => ({ ...p, _distanceKm: haversineDistanceKm(myLocation.latitude, myLocation.longitude, p.latitude, p.longitude) }))
        .filter((p) => p._distanceKm !== null)
        .sort((a, b) => a._distanceKm - b._distanceKm);
    } else if (sort === 'rating') list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    else if (sort === 'price_asc') list.sort((a, b) => (Number(a.starting_price) || 0) - (Number(b.starting_price) || 0));
    else if (sort === 'price_desc') list.sort((a, b) => (Number(b.starting_price) || 0) - (Number(a.starting_price) || 0));
    else if (sort === 'recent') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  }, [all, commune, priceRange, sort, myLocation]);

  return (
    <Screen scroll={false}>
      <View className="px-4 pt-4">
        <TopBar title="Recherche" />
        <View className="mb-3 flex-row items-center gap-2">
          <View className="flex-1">
            <Input
              placeholder="DJ, traiteur, photographe..."
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={load}
              containerClassName="mb-0"
            />
          </View>
          <Pressable
            onPress={handleNearMe}
            className={`h-[50px] w-[50px] items-center justify-center rounded-xl border ${myLocation ? 'border-amber-600 bg-amber-600' : 'border-gray-300 bg-white'}`}
          >
            <Navigation size={18} color={myLocation ? '#fff' : '#374151'} />
          </Pressable>
          <Pressable onPress={() => setShowFilters((s) => !s)} className="h-[50px] w-[50px] items-center justify-center rounded-xl border border-gray-300 bg-white">
            <Sliders size={18} />
          </Pressable>
        </View>

        <Banner message={locationError} tone="error" />
        {locatingMe ? <Banner message="Recherche de votre position..." tone="info" /> : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-2">
            {['Tous', ...EVENT_CATEGORIES].map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                className={`rounded-full border px-3 py-1.5 ${category === c ? 'border-amber-600 bg-amber-600' : 'border-gray-200 bg-white'}`}
              >
                <Text className={`text-xs font-medium ${category === c ? 'text-white' : 'text-gray-700'}`}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {showFilters ? (
          <View className="mb-3 rounded-xl border border-gray-200 bg-white p-3">
            <Text className="mb-2 text-xs font-semibold text-gray-700">Commune</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-2">
                <Pressable onPress={() => setCommune('')} className={`rounded-full border px-3 py-1.5 ${!commune ? 'border-amber-600 bg-amber-50' : 'border-gray-200'}`}>
                  <Text className="text-xs text-gray-700">Toutes</Text>
                </Pressable>
                {ABIDJAN_COMMUNES.map((c) => (
                  <Pressable key={c} onPress={() => setCommune(c)} className={`rounded-full border px-3 py-1.5 ${commune === c ? 'border-amber-600 bg-amber-50' : 'border-gray-200'}`}>
                    <Text className="text-xs text-gray-700">{c}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="mb-2 text-xs font-semibold text-gray-700">Budget</Text>
            <View className="mb-3 flex-row flex-wrap gap-2">
              {PRICE_RANGES.map((r) => (
                <Pressable key={r.label} onPress={() => setPriceRange(r)} className={`rounded-full border px-3 py-1.5 ${priceRange.label === r.label ? 'border-amber-600 bg-amber-50' : 'border-gray-200'}`}>
                  <Text className="text-xs text-gray-700">{r.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text className="mb-2 text-xs font-semibold text-gray-700">Trier par</Text>
            <View className="flex-row flex-wrap gap-2">
              {SORTS.map((s) => (
                <Pressable key={s.value} onPress={() => setSort(s.value)} className={`rounded-full border px-3 py-1.5 ${sort === s.value ? 'border-amber-600 bg-amber-50' : 'border-gray-200'}`}>
                  <Text className="text-xs text-gray-700">{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {loading ? (
        <LoadingView />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <ProviderCard
              provider={item}
              basePath="/client"
              isFavorite={favoriteIds.includes(String(item.id))}
              onToggleFavorite={toggle}
              isComparing={isSelected(item.id)}
              onToggleCompare={toggleCompare}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<SearchIcon size={40} color="#9ca3af" />}
              title="Aucun prestataire trouvé"
              description="Essayez d'élargir vos filtres."
            />
          }
        />
      )}
    </Screen>
  );
}
