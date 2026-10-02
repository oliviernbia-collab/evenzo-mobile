import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import TwoFactorSettings from '../../components/TwoFactorSettings';
import { ArrowLeft } from '../../components/icons';
import { updateProviderProfile } from '../../api/providers';
import { changePassword } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export default function ClientProfileEditScreen() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const { user: updated } = await updateProviderProfile(user.id, { name, phone, city });
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
      <Text className="mb-4 text-xl font-bold text-gray-900">Mon profil</Text>

      <Banner message={profileMsg} tone={profileMsg.includes('mis à jour') ? 'success' : 'error'} />
      <Input label="Nom complet" value={name} onChangeText={setName} />
      <Input label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="Ville" value={city} onChangeText={setCity} />
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
