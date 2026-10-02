import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import LoadingView from '../../components/LoadingView';
import { Upload, CheckCircle } from '../../components/icons';
import { getCart } from '../../api/cart';
import { previewOrderTotals, createOrder } from '../../api/orders';
import { uploadPaymentScreenshot } from '../../api/upload';
import { useAuth } from '../../context/AuthContext';
import { formatFcfa } from '../../utils/format';
import { extensionForMime } from '../../utils/mime';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { promoCode } = useLocalSearchParams();
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState('');
  const [screenshots, setScreenshots] = useState({});
  const [uploadingFor, setUploadingFor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    try {
      const cart = await getCart();
      setItems(cart);
      const preview = await previewOrderTotals(cart, promoCode);
      setGroups(preview.groups);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyNumber = async (number) => {
    await Clipboard.setStringAsync(number);
  };

  const pickScreenshot = async (providerId) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    setUploadingFor(providerId);
    try {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      const up = await uploadPaymentScreenshot({ uri: asset.uri, name: `screenshot.${extensionForMime(mimeType)}`, mimeType });
      setScreenshots((prev) => ({ ...prev, [providerId]: up.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingFor(null);
    }
  };

  const allScreenshotsReady = groups.length > 0 && groups.every((g) => screenshots[g.providerId]);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError('Nom et téléphone sont requis.');
      return;
    }
    if (!allScreenshotsReady) {
      setError('Ajoutez la capture de paiement pour chaque prestataire.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await createOrder({
        items,
        customer: { name, phone, email, location },
        payment_method: 'wave',
        screenshot_urls: screenshots,
        promo_code: promoCode || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingView />;

  if (done) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center py-16">
          <CheckCircle size={48} color="#16a34a" />
          <Text className="mt-4 text-lg font-bold text-gray-900">Commande envoyée !</Text>
          <Text className="mt-2 text-center text-sm text-gray-500">
            Votre paiement sera vérifié par un administrateur Evenzo sous 24h. Vous recevrez une notification.
          </Text>
          <Button title="Voir mes commandes" onPress={() => router.replace('/client/orders')} className="mt-6 px-8" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text className="mb-4 text-xl font-bold text-gray-900">Finaliser la commande</Text>

      <Banner message={error} tone="error" />

      <Text className="mb-2 text-sm font-semibold text-gray-700">Vos coordonnées</Text>
      <Input label="Nom complet" value={name} onChangeText={setName} />
      <Input label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="Email (optionnel)" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Input label="Lieu de l'événement (optionnel)" value={location} onChangeText={setLocation} />

      <Text className="mb-2 mt-2 text-sm font-semibold text-gray-700">Paiement par prestataire (Wave)</Text>
      <Text className="mb-3 text-xs text-gray-500">
        Chaque prestataire est payé directement sur son propre numéro Wave. Envoyez le montant exact puis joignez votre capture d'écran.
      </Text>

      {groups.map((g) => (
        <View key={g.providerId} className="mb-4 rounded-xl border border-gray-100 bg-white p-4">
          <Text className="font-semibold text-gray-900">{g.providerName}</Text>
          {g.discountAmount > 0 ? (
            <Text className="text-xs text-green-600">Réduction appliquée : −{formatFcfa(g.discountAmount)}</Text>
          ) : null}
          <Text className="mt-1 text-lg font-bold text-amber-700">{formatFcfa(g.total)}</Text>

          {g.waveNumber ? (
            <Pressable onPress={() => copyNumber(g.waveNumber)} className="mt-2 flex-row items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
              <Text className="font-mono text-sm text-amber-800">{g.waveNumber}</Text>
              <Text className="text-xs font-semibold text-amber-700">Copier</Text>
            </Pressable>
          ) : (
            <Banner message="Ce prestataire n'a pas encore configuré son numéro Wave." tone="warning" />
          )}

          <Pressable
            onPress={() => pickScreenshot(g.providerId)}
            className={`mt-3 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${screenshots[g.providerId] ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
          >
            {screenshots[g.providerId] ? (
              <>
                <CheckCircle size={16} color="#16a34a" />
                <Text className="text-sm font-medium text-green-700">Capture ajoutée</Text>
              </>
            ) : (
              <>
                <Upload size={16} color="#4b5563" />
                <Text className="text-sm font-medium text-gray-600">
                  {uploadingFor === g.providerId ? 'Envoi...' : "Joindre la capture d'écran"}
                </Text>
              </>
            )}
          </Pressable>
          {screenshots[g.providerId] ? (
            <Image source={{ uri: screenshots[g.providerId] }} className="mt-2 h-32 w-full rounded-lg" resizeMode="cover" />
          ) : null}
        </View>
      ))}

      <Button title="Confirmer la commande" onPress={handleSubmit} loading={submitting} className="mb-8" />
    </Screen>
  );
}
