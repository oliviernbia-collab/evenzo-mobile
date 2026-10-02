import { Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Screen from '../../../components/Screen';
import ServiceForm from '../../../components/ServiceForm';
import { ArrowLeft } from '../../../components/icons';
import { updateService } from '../../../api/services';

export default function EditServiceScreen() {
  const { id, name, description, price, cancellation_policy } = useLocalSearchParams();

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <Text className="mb-5 text-xl font-bold text-gray-900">Modifier le service</Text>
      <ServiceForm
        initial={{ name, description, price, cancellation_policy }}
        submitLabel="Enregistrer les modifications"
        onSubmit={async (payload) => { await updateService(id, payload); router.back(); }}
      />
    </Screen>
  );
}
