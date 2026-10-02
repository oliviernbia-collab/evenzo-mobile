import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Screen from '../../../components/Screen';
import Avatar from '../../../components/Avatar';
import StarRating from '../../../components/StarRating';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Banner from '../../../components/Banner';
import LoadingView from '../../../components/LoadingView';
import MonthCalendar from '../../../components/MonthCalendar';
import { ArrowLeft, Heart, HeartFilled, MapPin, Lock, FileText, Phone, MessageCircle } from '../../../components/icons';
import { getProviderById, getProviderContact, getSimilarProviders, getComplementaryProviders, getPublicAvailability } from '../../../api/providers';
import { addToCart } from '../../../api/cart';
import { useFavorites } from '../../../hooks/useFavorites';
import { formatFcfa, formatDate } from '../../../utils/format';
import { toWhatsAppRawNumber } from '../../../utils/phone';
import { TAB_SHADOW, TRANSLUCENT_WHITE } from '../../../constants/styles';

const TABS = [{ key: 'services', label: 'Services' }, { key: 'reviews', label: 'Avis' }, { key: 'about', label: 'À propos' }];

function SuggestionRow({ title, providers }) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-bold text-gray-900">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {providers.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push(`/client/provider/${p.id}`)}
              className="w-36 rounded-xl border border-gray-100 bg-white p-3"
            >
              <Avatar uri={p.avatar} name={p.name} size="lg" />
              <Text className="mt-2 text-sm font-semibold text-gray-900" numberOfLines={1}>{p.name}</Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>{p.category}</Text>
              <StarRating rating={p.rating} reviewCount={p.review_count} size={11} />
              {p.starting_price ? (
                <Text className="mt-1 text-xs font-semibold text-amber-700">Dès {formatFcfa(p.starting_price)}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { favoriteIds, toggle } = useFavorites();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('services');
  const [contact, setContact] = useState(null);
  const [contactError, setContactError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [similar, setSimilar] = useState([]);
  const [complementary, setComplementary] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await getProviderById(id);
      setProvider(data);
      const [sim, comp, avail] = await Promise.all([
        getSimilarProviders(Number(id), data.category).catch(() => []),
        getComplementaryProviders(data.category).catch(() => []),
        getPublicAvailability(id).catch(() => []),
      ]);
      setSimilar(sim);
      setComplementary(comp);
      setUnavailableDates(avail.map((d) => String(d).slice(0, 10)));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const isFavorite = favoriteIds.includes(String(id));

  const handleUnlockContact = async () => {
    setContactError('');
    try {
      const data = await getProviderContact(id);
      setContact(data);
    } catch (err) {
      setContactError(err.message);
    }
  };

  const handleAddToCart = async (service) => {
    try {
      await addToCart({
        provider_id: provider.id,
        provider_name: provider.name,
        provider_avatar: provider.avatar,
        provider_category: provider.category,
        provider_commune: provider.commune,
        service_id: service.id,
        service_name: service.name,
        service_price: service.price,
        quantity: 1,
      });
      setFeedback(`${service.name} ajouté au panier.`);
      setTimeout(() => setFeedback(''), 2500);
    } catch (err) {
      setFeedback(err.message);
    }
  };

  const goToQuoteRequest = (service) => {
    router.push({
      pathname: '/client/quote-request',
      params: { providerId: provider.id, serviceId: service.id, serviceName: service.name, servicePrice: service.price },
    });
  };

  if (loading) return <LoadingView />;
  if (!provider) return <Screen><Banner message="Prestataire introuvable." tone="error" /></Screen>;

  const cover = provider.portfolio?.[0]?.url_medium;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <ScrollView>
        <View className="relative h-48 w-full bg-gray-200">
          {cover ? <Image source={{ uri: cover }} className="h-full w-full" resizeMode="cover" /> : null}
          <Pressable onPress={() => router.back()} className="absolute left-3 top-3 h-10 w-10 items-center justify-center rounded-full" style={TRANSLUCENT_WHITE}>
            <ArrowLeft size={18} />
          </Pressable>
          <Pressable onPress={() => toggle(provider.id)} className="absolute right-3 top-3 h-10 w-10 items-center justify-center rounded-full" style={TRANSLUCENT_WHITE}>
            {isFavorite ? <HeartFilled color="#dc2626" size={18} /> : <Heart size={18} />}
          </Pressable>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row items-center gap-3">
            <Avatar uri={provider.avatar} name={provider.name} size="lg" />
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-bold text-gray-900">{provider.name}</Text>
                {provider.kyc_badge ? <Badge label="Vérifié" tone="green" /> : null}
                {provider.provider_tier === 'pro' ? <Badge label="Pro" tone="amber" /> : null}
              </View>
              <Text className="text-sm text-gray-500">{provider.category}</Text>
              <StarRating rating={provider.rating} reviewCount={provider.review_count} />
            </View>
          </View>

          <View className="mt-3 flex-row items-center gap-1">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600">{provider.commune ? `${provider.commune}, ` : ''}{provider.city}</Text>
          </View>

          {feedback ? <Banner message={feedback} tone="success" /> : null}

          <View className="my-4 flex-row gap-2">
            {!contact ? (
              <Button
                title={contactError ? 'Devis requis pour contacter' : 'Afficher le contact'}
                variant="secondary"
                icon={<Lock size={16} color="#92400e" />}
                onPress={handleUnlockContact}
                className="flex-1"
              />
            ) : (
              <>
                <Pressable
                  onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3"
                >
                  <Phone size={16} color="#374151" />
                  <Text className="text-sm font-semibold text-gray-800">Appeler</Text>
                </Pressable>
                <Pressable
                  onPress={() => Linking.openURL(`https://wa.me/${toWhatsAppRawNumber(contact.phone)}?text=${encodeURIComponent(`Bonjour ${provider.name}, je vous contacte depuis Evenzo.`)}`)}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3"
                >
                  <MessageCircle size={16} color="#fff" />
                  <Text className="text-sm font-semibold text-white">WhatsApp</Text>
                </Pressable>
              </>
            )}
          </View>
          {contactError ? <Banner message={contactError} tone="warning" /> : null}

          <View className="mb-4 flex-row rounded-xl bg-gray-100 p-1">
            {TABS.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                className={`flex-1 rounded-lg py-2 ${tab === t.key ? 'bg-white' : ''}`}
                style={tab === t.key ? TAB_SHADOW : undefined}
              >
                <Text className={`text-center text-sm font-medium ${tab === t.key ? 'text-gray-900' : 'text-gray-500'}`}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {tab === 'services' ? (
            <View className="mb-8">
              {(provider.services || []).length === 0 ? (
                <Text className="text-sm text-gray-500">Aucun service publié.</Text>
              ) : provider.services.map((s) => (
                <View key={s.id} className="mb-3 rounded-xl border border-gray-100 bg-white p-3">
                  <Text className="font-semibold text-gray-900">{s.name}</Text>
                  {s.description ? <Text className="mt-1 text-xs text-gray-500">{s.description}</Text> : null}
                  <Text className="mt-1 text-sm font-bold text-amber-700">{formatFcfa(s.price)}</Text>
                  <View className="mt-3 flex-row gap-2">
                    <Button title="Devis" variant="secondary" icon={<FileText size={14} color="#92400e" />} onPress={() => goToQuoteRequest(s)} className="flex-1 py-2.5" />
                    <Button title="Ajouter au panier" onPress={() => handleAddToCart(s)} className="flex-1 py-2.5" />
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {tab === 'reviews' ? (
            <View className="mb-8">
              {(provider.reviews || []).length === 0 ? (
                <Text className="text-sm text-gray-500">Aucun avis pour le moment.</Text>
              ) : provider.reviews.map((r) => (
                <View key={r.id} className="mb-3 rounded-xl border border-gray-100 bg-white p-3">
                  <View className="mb-1 flex-row items-center justify-between">
                    <Text className="font-semibold text-gray-900">{r.client_name}</Text>
                    <StarRating rating={r.rating} showValue={false} />
                  </View>
                  <Text className="text-xs text-gray-400">{formatDate(r.created_at)}</Text>
                  {r.comment ? <Text className="mt-2 text-sm text-gray-600">{r.comment}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          {tab === 'about' ? (
            <View className="mb-8">
              {provider.bio ? <Text className="mb-4 text-sm text-gray-600">{provider.bio}</Text> : null}
              <View className="mb-4 flex-row flex-wrap gap-2">
                {provider.years_experience ? <Badge label={`${provider.years_experience} ans d'expérience`} tone="blue" /> : null}
                {provider.response_time ? <Badge label={`Répond en ${provider.response_time}`} tone="gray" /> : null}
                {provider.completed_events ? <Badge label={`${provider.completed_events} événements réalisés`} tone="green" /> : null}
              </View>
              {(provider.portfolio || []).length > 0 ? (
                <View className="mb-5 flex-row flex-wrap gap-2">
                  {provider.portfolio.map((img) => (
                    <Image key={img.id} source={{ uri: img.url_thumb }} className="h-24 w-24 rounded-lg" />
                  ))}
                </View>
              ) : null}

              <Text className="mb-3 text-sm font-semibold text-gray-700">Disponibilités</Text>
              <MonthCalendar markedDates={unavailableDates} />
            </View>
          ) : null}

          {similar.length > 0 ? (
            <SuggestionRow title="Prestataires similaires" providers={similar} />
          ) : null}
          {complementary.length > 0 ? (
            <SuggestionRow title="Prestataires complémentaires" providers={complementary} />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
