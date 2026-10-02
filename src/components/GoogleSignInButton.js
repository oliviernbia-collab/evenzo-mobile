import { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Banner from './Banner';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

// Google exige un Client ID OAuth natif (type "iOS"/"Android") distinct de
// celui utilisé par la version web (type "Web application") — à créer dans
// Google Cloud Console puis renseigner dans mobile/.env. Le bouton reste
// masqué tant qu'aucun n'est configuré (même comportement que le web avec
// VITE_GOOGLE_CLIENT_ID absent).
const CLIENT_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  default: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
});

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

/** Bouton "Continuer avec Google" — masqué si aucun Client ID natif n'est configuré. */
export default function GoogleSignInButton({ onSuccess }) {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!CLIENT_ID) return null;

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'evenzo', path: 'redirect' });

  const handlePress = async () => {
    setError('');
    setLoading(true);
    try {
      const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        redirectUri,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      });
      const result = await request.promptAsync(discovery);
      if (result.type !== 'success') {
        setLoading(false);
        return;
      }
      const tokens = await AuthSession.exchangeCodeAsync(
        { clientId: CLIENT_ID, redirectUri, code: result.params.code, extraParams: { code_verifier: request.codeVerifier } },
        discovery
      );
      if (!tokens.idToken) throw new Error('Jeton Google manquant.');
      const user = await loginWithGoogle(tokens.idToken);
      onSuccess?.(user);
    } catch (err) {
      setError(err.message || 'Connexion Google impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="mb-4">
      <Banner message={error} tone="error" />
      <Pressable
        onPress={handlePress}
        disabled={loading}
        className="flex-row items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3.5"
      >
        <Text className="font-semibold text-gray-700">{loading ? 'Connexion...' : 'Continuer avec Google'}</Text>
      </Pressable>
    </View>
  );
}
