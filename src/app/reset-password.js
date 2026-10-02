import { useState } from 'react';
import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Banner from '../components/Banner';
import { completePasswordReset } from '../api/auth';

export default function ResetPasswordScreen() {
  const { resetSessionToken } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setError('Les deux mots de passe doivent être identiques.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await completePasswordReset({ resetSessionToken, newPassword, confirmPassword });
      setSuccess('Mot de passe réinitialisé. Vous pouvez vous connecter.');
      setTimeout(() => router.replace('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Impossible de réinitialiser le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text className="mb-1 mt-4 text-2xl font-bold text-gray-900">Nouveau mot de passe</Text>
      <Text className="mb-6 text-sm text-gray-500">
        8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.
      </Text>

      <Banner message={error} tone="error" />
      <Banner message={success} tone="success" />

      <Input label="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="••••••••" />
      <Input label="Confirmer le mot de passe" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="••••••••" />

      <Button title="Réinitialiser le mot de passe" onPress={handleSubmit} loading={loading} />
    </Screen>
  );
}
