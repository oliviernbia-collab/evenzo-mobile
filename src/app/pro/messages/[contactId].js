import { useLocalSearchParams } from 'expo-router';
import MessageThread from '../../../components/MessageThread';

export default function ProviderMessageThreadScreen() {
  const { contactId, name } = useLocalSearchParams();
  return <MessageThread contactId={contactId} contactName={name} />;
}
