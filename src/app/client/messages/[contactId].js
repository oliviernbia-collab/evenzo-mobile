import { useLocalSearchParams } from 'expo-router';
import MessageThread from '../../../components/MessageThread';

export default function ClientMessageThreadScreen() {
  const { contactId, name } = useLocalSearchParams();
  return <MessageThread contactId={contactId} contactName={name} />;
}
