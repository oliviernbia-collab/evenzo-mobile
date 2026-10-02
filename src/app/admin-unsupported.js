import { View, Text } from 'react-native';
import { ShieldCheck } from '../components/icons';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';

export default function AdminUnsupported() {
  const { logout } = useAuth();
  return (
    <Screen scroll={false}>
      <View className="flex-1 items-center justify-center px-6">
        <ShieldCheck size={48} color="#d97706" />
        <Text className="mt-4 text-center text-lg font-semibold text-gray-900">
          Administration non disponible sur mobile
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          Le back-office Evenzo (modération, litiges, KYC, utilisateurs) est réservé à la version web.
          Connectez-vous depuis un ordinateur pour y accéder.
        </Text>
        <Button title="Se déconnecter" variant="secondary" onPress={logout} className="mt-6 px-8" />
      </View>
    </Screen>
  );
}
