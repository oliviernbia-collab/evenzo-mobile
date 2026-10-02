import { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Link } from 'expo-router';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Banner from '../components/Banner';
import BrandMark from '../components/BrandMark';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

function targetForRole(role) {
  if (role === 'provider') return '/pro/dashboard';
  if (role === 'admin') return '/admin-unsupported';
  return '/client/home';
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFAToken, setTwoFAToken] = useState('');
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Veuillez saisir votre email et votre mot de passe.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await login(email.trim(), password, needs2FA ? twoFAToken : undefined);
      if (result.requires2FA) {
        setNeeds2FA(true);
        return;
      }
      router.replace(targetForRole(result.user.role));
    } catch (err) {
      setError(err.message || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <Screen>
        <View className="mt-10 mb-8 items-center">
          <BrandMark size={88} />
          <Text className="mt-4 text-2xl font-bold text-gray-900">Bon retour sur Evenzo</Text>
          <Text className="mt-1 text-sm text-gray-500">Connectez-vous pour continuer</Text>
        </View>

        <Banner message={error} tone="error" />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="vous@exemple.com"
        />
        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
        {needs2FA ? (
          <Input
            label="Code de vérification (2FA)"
            value={twoFAToken}
            onChangeText={setTwoFAToken}
            keyboardType="number-pad"
            placeholder="123456"
            maxLength={6}
          />
        ) : null}

        <Pressable onPress={() => router.push('/forgot-password')} className="mb-5 self-end">
          <Text className="text-sm font-medium text-amber-700">Mot de passe oublié ?</Text>
        </Pressable>

        <Button title={needs2FA ? 'Valider le code' : 'Se connecter'} onPress={handleSubmit} loading={loading} />

        <View className="my-5 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-gray-200" />
          <Text className="text-xs text-gray-400">OU</Text>
          <View className="h-px flex-1 bg-gray-200" />
        </View>
        <GoogleSignInButton onSuccess={(user) => router.replace(targetForRole(user.role))} />

        <View className="mt-2 flex-row justify-center gap-1">
          <Text className="text-sm text-gray-500">Pas encore de compte ?</Text>
          <Link href="/register" asChild>
            <Pressable><Text className="text-sm font-semibold text-amber-700">S'inscrire</Text></Pressable>
          </Link>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
