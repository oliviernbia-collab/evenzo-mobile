import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Banner from '../../components/Banner';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { ArrowLeft, Camera, X } from '../../components/icons';
import { getPortfolio, deletePortfolioPhoto, uploadPortfolioPhotos } from '../../api/upload';
import { useAuth } from '../../context/AuthContext';
import { DARK_OVERLAY_60 } from '../../constants/styles';
import { extensionForMime } from '../../utils/mime';

export default function ProviderPortfolioScreen() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setPhotos(await getPortfolio(user.id)); } catch { setPhotos([]); }
  }, [user.id]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleAdd = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 10, quality: 0.8 });
    if (result.canceled) return;
    setError('');
    setUploading(true);
    try {
      const files = result.assets.map((a) => {
        const mimeType = a.mimeType || 'image/jpeg';
        return { uri: a.uri, name: `photo.${extensionForMime(mimeType)}`, mimeType };
      });
      await uploadPortfolioPhotos(files);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = (photo) => {
    Alert.alert('Supprimer cette photo ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await deletePortfolioPhoto(photo.id); load(); } },
    ]);
  };

  if (loading) return <LoadingView />;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-900">Mon portfolio</Text>
      </View>

      <Banner message={error} tone="error" />

      <Pressable
        onPress={handleAdd}
        disabled={uploading}
        className="mb-4 flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-5"
      >
        <Camera size={18} color="#92400e" />
        <Text className="font-semibold text-amber-800">{uploading ? 'Envoi en cours...' : 'Ajouter des photos (max 10 en formule Simple)'}</Text>
      </Pressable>

      {photos.length === 0 ? (
        <EmptyState icon={<Camera size={40} color="#9ca3af" />} title="Aucune photo pour le moment" />
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {photos.map((p) => (
            <View key={p.id} className="relative">
              <Image source={{ uri: p.url_thumb }} className="h-28 w-28 rounded-lg" />
              <Pressable onPress={() => confirmDelete(p)} className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full" style={DARK_OVERLAY_60}>
                <X size={12} color="#fff" />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
