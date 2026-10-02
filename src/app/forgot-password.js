import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Banner from '../components/Banner';
import { ArrowLeft } from '../components/icons';
import { requestPasswordReset } from '../api/auth';

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      setError('Veuillez saisir votre email ou votre numéro de téléphone.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await requestPasswordReset({ identifier: identifier.trim() });
      router.push({ pathname: '/verify-code', params: { identifier: data.identifier, devCode: data.devCode || '' } });
    } catch (err) {
      setError(err.message || 'Impossible d\'envoyer le code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 mt-2 flex-row items-center gap-2">
        <ArrowLeft size={18} />
        <Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>

      <Text className="mb-1 text-2xl font-bold text-gray-900">Mot de passe oublié</Text>
      <Text className="mb-6 text-sm text-gray-500">
        Saisissez votre email ou votre numéro de téléphone : un code à 6 chiffres vous sera envoyé.
      </Text>

      <Banner message={error} tone="error" />

      <Input
        label="Email ou téléphone"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        placeholder="vous@exemple.com ou 07 00 00 00 00"
      />

      <Button title="Recevoir le code" onPress={handleSubmit} loading={loading} />
    </Screen>
  );
}
