import { Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../../components/Screen';
import ServiceForm from '../../../components/ServiceForm';
import { ArrowLeft } from '../../../components/icons';
import { createService } from '../../../api/services';

export default function NewServiceScreen() {
  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <Text className="mb-5 text-xl font-bold text-gray-900">Nouveau service</Text>
      <ServiceForm
        submitLabel="Publier le service"
        onSubmit={async (payload) => { await createService(payload); router.back(); }}
      />
    </Screen>
  );
}
