import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Avatar from '../../components/Avatar';
import TwoFactorSettings from '../../components/TwoFactorSettings';
import { ArrowLeft, Camera } from '../../components/icons';
import { updateProviderProfile } from '../../api/providers';
import { uploadAvatar } from '../../api/upload';
import { changePassword } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { EVENT_CATEGORIES, ABIDJAN_COMMUNES } from '../../constants/categories';
import { extensionForMime } from '../../utils/mime';

export default function ProviderProfileEditScreen() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [category, setCategory] = useState(user?.category || EVENT_CATEGORIES[0]);
  const [commune, setCommune] = useState(user?.commune || '');
  const [startingPrice, setStartingPrice] = useState(user?.starting_price ? String(user.starting_price) : '');
  const [yearsExperience, setYearsExperience] = useState(user?.years_experience ? String(user.years_experience) : '');
  const [waveNumber, setWaveNumber] = useState(user?.wave_number || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleAvatarChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    setUploadingAvatar(true);
    try {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      const up = await uploadAvatar({ uri: asset.uri, name: `avatar.${extensionForMime(mimeType)}`, mimeType });
      updateUser({ avatar: up.url });
    } catch (err) {
      setProfileMsg(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const { user: updated } = await updateProviderProfile(user.id, {
        name, phone, bio, category, commune,
        starting_price: startingPrice, years_experience: yearsExperience, wave_number: waveNumber,
      });
      updateUser(updated);
      setProfileMsg('Profil mis à jour.');
    } catch (err) {
      setProfileMsg(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Les mots de passe ne correspondent pas.');
      return;
    }
    setSavingPassword(true);
    setPasswordMsg('');
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setPasswordMsg('Mot de passe modifié. Reconnexion nécessaire.');
      setTimeout(async () => { await logout(); router.replace('/login'); }, 1500);
    } catch (err) {
      setPasswordMsg(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <Text className="mb-4 text-xl font-bold text-gray-900">Mon profil prestataire</Text>

      <Pressable onPress={handleAvatarChange} className="mb-5 items-center">
        <View className="relative">
          <Avatar uri={user?.avatar} name={user?.name} size="xl" />
          <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-amber-600">
            <Camera size={14} color="#fff" />
          </View>
        </View>
        <Text className="mt-2 text-xs text-amber-700">{uploadingAvatar ? 'Envoi...' : 'Changer la photo'}</Text>
      </Pressable>

      <Banner message={profileMsg} tone={profileMsg.includes('mis à jour') ? 'success' : 'error'} />

      <Input label="Nom complet" value={name} onChangeText={setName} />
      <Input label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="Bio / présentation" value={bio} onChangeText={setBio} multiline numberOfLines={4} />

      <Text className="mb-2 text-sm font-medium text-gray-700">Catégorie</Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {EVENT_CATEGORIES.map((c) => (
          <Pressable key={c} onPress={() => setCategory(c)} className={`rounded-full border px-3 py-1.5 ${category === c ? 'border-amber-600 bg-amber-50' : 'border-gray-200'}`}>
            <Text className="text-xs text-gray-700">{c}</Text>
          </Pressable>
        ))}
      </View>

      <Text className="mb-2 text-sm font-medium text-gray-700">Commune</Text>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {ABIDJAN_COMMUNES.map((c) => (
          <Pressable key={c} onPress={() => setCommune(c)} className={`rounded-full border px-3 py-1.5 ${commune === c ? 'border-amber-600 bg-amber-50' : 'border-gray-200'}`}>
            <Text className="text-xs text-gray-700">{c}</Text>
          </Pressable>
        ))}
      </View>

      <Input label="Prix de départ (FCFA)" value={startingPrice} onChangeText={setStartingPrice} keyboardType="number-pad" />
      <Input label="Années d'expérience" value={yearsExperience} onChangeText={setYearsExperience} keyboardType="number-pad" />
      <Input
        label="Numéro Wave (pour être payé)"
        value={waveNumber}
        onChangeText={setWaveNumber}
        keyboardType="phone-pad"
        placeholder="07 00 00 00 00"
      />

      <Button title="Enregistrer" onPress={saveProfile} loading={savingProfile} className="mb-8" />

      <Text className="mb-4 text-lg font-bold text-gray-900">Changer le mot de passe</Text>
      <Banner message={passwordMsg} tone={passwordMsg.includes('modifié') ? 'success' : 'error'} />
      <Input label="Mot de passe actuel" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
      <Input label="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <Input label="Confirmer" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <Button title="Mettre à jour le mot de passe" variant="secondary" onPress={savePassword} loading={savingPassword} className="mb-8" />

      <TwoFactorSettings />
    </Screen>
  );
}
