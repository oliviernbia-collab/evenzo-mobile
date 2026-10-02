import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import Banner from '../components/Banner';
import { ArrowLeft } from '../components/icons';
import { sendContactMessage } from '../api/contact';
import { useAuth } from '../context/AuthContext';

export default function ContactScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      setError('Nom, email et un message d\'au moins 10 caractères sont requis.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await sendContactMessage({ name, email, subject, message });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <Text className="mb-1 text-xl font-bold text-gray-900">Contacter le support</Text>
      <Text className="mb-5 text-sm text-gray-500">Notre équipe vous répond généralement sous 24h ouvrées.</Text>

      <Banner message={error} tone="error" />
      {sent ? (
        <Banner message="Message envoyé ! Nous vous répondrons par email." tone="success" />
      ) : (
        <>
          <Input label="Nom complet" value={name} onChangeText={setName} />
          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Input label="Sujet (optionnel)" value={subject} onChangeText={setSubject} />
          <Input label="Message" value={message} onChangeText={setMessage} multiline numberOfLines={6} placeholder="Décrivez votre demande..." />
          <Button title="Envoyer" onPress={handleSubmit} loading={sending} />
        </>
      )}
    </Screen>
  );
}
