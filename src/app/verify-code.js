import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Banner from '../components/Banner';
import { ArrowLeft } from '../components/icons';
import { verifyResetCode } from '../api/auth';

export default function VerifyCodeScreen() {
  const { identifier, devCode } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (devCode) setCode(String(devCode));
  }, [devCode]);

  const handleSubmit = async () => {
    if (code.trim().length !== 6) {
      setError('Le code doit comporter 6 chiffres.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await verifyResetCode({ identifier, code: code.trim() });
      router.push({ pathname: '/reset-password', params: { resetSessionToken: data.resetSessionToken } });
    } catch (err) {
      setError(err.message || 'Code incorrect.');
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

      <Text className="mb-1 text-2xl font-bold text-gray-900">Vérification</Text>
      <Text className="mb-6 text-sm text-gray-500">
        Entrez le code à 6 chiffres envoyé à {identifier}. Valide 15 minutes, 3 tentatives maximum.
      </Text>

      <Banner message={error} tone="error" />
      {devCode ? <Banner message={`Mode développement — code : ${devCode}`} tone="info" /> : null}

      <Input
        label="Code à 6 chiffres"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
      />

      <Button title="Vérifier le code" onPress={handleSubmit} loading={loading} />
    </Screen>
  );
}
