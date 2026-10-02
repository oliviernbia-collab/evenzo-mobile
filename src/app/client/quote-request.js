import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Screen from '../../components/Screen';
import Avatar from '../../components/Avatar';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import LoadingView from '../../components/LoadingView';
import MonthCalendar from '../../components/MonthCalendar';
import { ArrowLeft, FileText, ShoppingCart, Minus, Plus, CheckCircle } from '../../components/icons';
import { getProviderById, getPublicAvailability } from '../../api/providers';
import { createQuoteRequest } from '../../api/quotes';
import { addToCart } from '../../api/cart';
import { formatFcfa, formatDate } from '../../utils/format';

const EVENT_TYPES = [
  { value: 'Mariage', label: 'Mariage (Civil & Religieux)' },
  { value: 'Fiançailles / Dot', label: 'Fiançailles / Dot Coutumière' },
  { value: 'Anniversaire', label: 'Anniversaire & Célébration' },
  { value: 'Corporate / Gala', label: "Gala d'Entreprise & Cocktail" },
  { value: 'Autre réception', label: 'Autre réception privée' },
];

function Stepper({ value, onChange, step = 1, min = 0, suffix = '' }) {
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-gray-300 bg-gray-50 p-1.5">
      <Pressable onPress={() => onChange(Math.max(min, value - step))} className="h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white">
        <Minus size={14} />
      </Pressable>
      <Text className="font-semibold text-gray-900">{value}{suffix}</Text>
      <Pressable onPress={() => onChange(value + step)} className="h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white">
        <Plus size={14} />
      </Pressable>
    </View>
  );
}

/** Demande de devis — formulaire dédié (type d'événement, date, heure, invités, quantité). */
export default function QuoteRequestScreen() {
  const { providerId, serviceId, serviceName, servicePrice } = useLocalSearchParams();
  const [provider, setProvider] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [eventType, setEventType] = useState('Mariage');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [guestCount, setGuestCount] = useState(150);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [sendingQuote, setSendingQuote] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [done, setDone] = useState(null); // 'quote' | 'cart'

  const load = useCallback(async () => {
    try {
      const [data, avail] = await Promise.all([
        getProviderById(providerId),
        getPublicAvailability(providerId).catch(() => []),
      ]);
      setProvider(data);
      setUnavailableDates(avail.map((d) => String(d).slice(0, 10)));
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => { load(); }, [load]);

  const composeDetails = () => {
    let text = `Type d'événement : ${eventType}.`;
    if (eventTime) text += ` Heure souhaitée : ${eventTime}.`;
    text += ` Nombre d'invités estimé : ${guestCount}. Quantité souhaitée : ${quantity}.`;
    if (notes.trim()) text += ` ${notes.trim()}`;
    return text;
  };

  const handleRequestQuote = async () => {
    if (!eventDate) {
      setError('Choisissez une date souhaitée pour votre événement.');
      return;
    }
    setError('');
    setSendingQuote(true);
    try {
      await createQuoteRequest({
        provider_id: provider.id,
        service_id: serviceId || undefined,
        service_name: serviceName || `Prestation ${provider.category} (${eventType})`,
        event_date: eventDate,
        location: provider.commune || provider.city || '',
        details: composeDetails(),
      });
      setDone('quote');
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingQuote(false);
    }
  };

  const handleAddToCart = async () => {
    setError('');
    setAddingToCart(true);
    try {
      await addToCart({
        provider_id: provider.id,
        provider_name: provider.name,
        provider_avatar: provider.avatar,
        provider_category: provider.category,
        provider_commune: provider.commune,
        service_id: serviceId || undefined,
        service_name: serviceName || `Prestation ${provider.category} (${eventType})`,
        service_price: servicePrice || provider.starting_price || 0,
        quantity,
        event_date: eventDate || undefined,
        event_time: eventTime || undefined,
        event_type: eventType,
        guest_count: guestCount,
        notes: notes.trim() || undefined,
      });
      setDone('cart');
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <LoadingView />;

  if (done) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center py-16">
          <CheckCircle size={48} color="#16a34a" />
          <Text className="mt-4 text-lg font-bold text-gray-900">
            {done === 'quote' ? 'Demande de devis envoyée !' : 'Ajouté au panier !'}
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500">
            {done === 'quote'
              ? `${provider.name} vous répondra avec un devis personnalisé.`
              : 'Retrouvez cet article dans votre panier pour finaliser votre commande.'}
          </Text>
          <View className="mt-6 w-full gap-2 px-6">
            {done === 'quote' ? (
              <Button title="Voir mes devis" onPress={() => router.replace('/client/quotes')} />
            ) : (
              <Button title="Voir mon panier" onPress={() => router.replace('/client/cart')} />
            )}
            <Button title="Retour à la fiche" variant="secondary" onPress={() => router.back()} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>

      <View className="mb-5 flex-row items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
        <Avatar uri={provider.avatar} name={provider.name} size="md" />
        <View className="flex-1">
          <Text className="font-bold text-gray-900" numberOfLines={1}>{provider.name}</Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>{serviceName || provider.category}</Text>
        </View>
        <Text className="font-bold text-amber-700">Dès {formatFcfa(servicePrice || provider.starting_price)}</Text>
      </View>

      <Banner message={error} tone="error" />

      <Text className="mb-2 text-sm font-semibold text-gray-700">Type d'événement</Text>
      <View className="mb-5 gap-2">
        {EVENT_TYPES.map((t) => (
          <Pressable
            key={t.value}
            onPress={() => setEventType(t.value)}
            className={`rounded-xl border px-4 py-3 ${eventType === t.value ? 'border-amber-600 bg-amber-50' : 'border-gray-200 bg-white'}`}
          >
            <Text className={`font-medium ${eventType === t.value ? 'text-amber-800' : 'text-gray-700'}`}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="mb-2 text-sm font-semibold text-gray-700">Date souhaitée</Text>
      {eventDate ? <Text className="mb-2 text-sm text-amber-700">{formatDate(eventDate, { day: 'numeric', month: 'long', year: 'numeric' })}</Text> : null}
      <View className="mb-5">
        <MonthCalendar
          selectedDate={eventDate}
          disabledDates={unavailableDates}
          onDayPress={(d) => setEventDate(d)}
        />
      </View>

      <Input label="Heure souhaitée (optionnel)" value={eventTime} onChangeText={setEventTime} placeholder="ex : 16:00" />

      <Text className="mb-2 text-sm font-semibold text-gray-700">Nombre d'invités estimé</Text>
      <View className="mb-4"><Stepper value={guestCount} onChange={setGuestCount} step={25} min={10} suffix=" personnes" /></View>

      <Text className="mb-2 text-sm font-semibold text-gray-700">Quantité</Text>
      <View className="mb-4"><Stepper value={quantity} onChange={setQuantity} min={1} /></View>

      <Input label="Précisions complémentaires (optionnel)" value={notes} onChangeText={setNotes} multiline numberOfLines={3} placeholder="Décrivez vos besoins..." />

      <View className="mb-8 gap-2">
        <Button
          title={sendingQuote ? 'Envoi en cours...' : 'Demander un devis via Evenzo'}
          icon={<FileText size={16} color="#fff" />}
          onPress={handleRequestQuote}
          loading={sendingQuote}
        />
        <Button
          title="Ajouter au panier & réserver"
          variant="secondary"
          icon={<ShoppingCart size={16} color="#92400e" />}
          onPress={handleAddToCart}
          loading={addingToCart}
        />
      </View>
    </Screen>
  );
}
