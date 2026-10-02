import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router, Link } from 'expo-router';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Banner from '../components/Banner';
import BrandMark from '../components/BrandMark';
import { Check } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { acceptTerms } from '../api/auth';
import { EVENT_CATEGORIES, ABIDJAN_COMMUNES } from '../constants/categories';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [role, setRole] = useState('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Abidjan');
  const [commune, setCommune] = useState('');
  const [category, setCategory] = useState(EVENT_CATEGORIES[0]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!acceptedTerms) {
      setError("Vous devez accepter les conditions d'utilisation pour continuer.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await register({
        name: name.trim(), email: email.trim(), password, phone: phone.trim(), role,
        city, commune: role === 'provider' ? commune : undefined,
        category: role === 'provider' ? category : undefined,
      });
      acceptTerms().catch(() => {});
      router.replace(user.role === 'provider' ? '/pro/dashboard' : '/client/home');
    } catch (err) {
      setError(err.message || "Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="mt-6 mb-6 items-center">
        <BrandMark size={80} />
        <Text className="mt-4 text-2xl font-bold text-gray-900">Créer un compte</Text>
      </View>

      <Banner message={error} tone="error" />

      <Text className="mb-2 text-sm font-medium text-gray-700">Je suis...</Text>
      <View className="mb-5 flex-row gap-2">
        {[{ v: 'client', label: 'Un client' }, { v: 'provider', label: 'Un prestataire' }].map((opt) => (
          <Pressable
            key={opt.v}
            onPress={() => setRole(opt.v)}
            className={`flex-1 rounded-xl border px-3 py-3 ${role === opt.v ? 'border-amber-600 bg-amber-50' : 'border-gray-300 bg-white'}`}
          >
            <Text className={`text-center text-sm font-semibold ${role === opt.v ? 'text-amber-700' : 'text-gray-600'}`}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Input label="Nom complet" value={name} onChangeText={setName} placeholder="Votre nom" />
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="vous@exemple.com" />
      <Input label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="07 00 00 00 00" />
      <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholder="8 caractères min., majuscule, chiffre, spécial" />
      <Input label="Ville" value={city} onChangeText={setCity} placeholder="Abidjan" />

      {role === 'provider' ? (
        <>
          <Text className="mb-2 text-sm font-medium text-gray-700">Catégorie de prestation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {EVENT_CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  className={`rounded-full border px-3 py-2 ${category === c ? 'border-amber-600 bg-amber-50' : 'border-gray-300 bg-white'}`}
                >
                  <Text className={`text-xs font-medium ${category === c ? 'text-amber-700' : 'text-gray-600'}`}>{c}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text className="mb-2 text-sm font-medium text-gray-700">Commune (Abidjan)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
            <View className="flex-row gap-2">
              {ABIDJAN_COMMUNES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCommune(c)}
                  className={`rounded-full border px-3 py-2 ${commune === c ? 'border-amber-600 bg-amber-50' : 'border-gray-300 bg-white'}`}
                >
                  <Text className={`text-xs font-medium ${commune === c ? 'text-amber-700' : 'text-gray-600'}`}>{c}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </>
      ) : null}

      <Pressable onPress={() => setAcceptedTerms((v) => !v)} className="mb-5 flex-row items-start gap-3">
        <View className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${acceptedTerms ? 'border-amber-600 bg-amber-600' : 'border-gray-300'}`}>
          {acceptedTerms ? <Check size={12} color="#fff" /> : null}
        </View>
        <Text className="flex-1 text-sm text-gray-600">
          J'accepte les conditions générales d'utilisation et la politique de confidentialité d'Evenzo.
        </Text>
      </Pressable>

      <Button title="Créer mon compte" onPress={handleSubmit} loading={loading} />

      <View className="mt-6 mb-4 flex-row justify-center gap-1">
        <Text className="text-sm text-gray-500">Déjà un compte ?</Text>
        <Link href="/login" asChild>
          <Pressable><Text className="text-sm font-semibold text-amber-700">Se connecter</Text></Pressable>
        </Link>
      </View>
    </Screen>
  );
}
