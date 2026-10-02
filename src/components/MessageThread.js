import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, FlatList, Image, KeyboardAvoidingView, Platform, Linking, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from './Input';
import Avatar from './Avatar';
import Banner from './Banner';
import Badge from './Badge';
import LoadingView from './LoadingView';
import EmptyState from './EmptyState';
import { ArrowLeft, Send, Paperclip, Phone, FileText } from './icons';
import { getMessagesBetween, sendMessage, uploadMessageAttachment, getWhatsAppUnlock } from '../api/messages';
import { getMyQuotes } from '../api/quotes';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime, formatFcfa } from '../utils/format';
import { extensionForMime } from '../utils/mime';
import { toWhatsAppRawNumber } from '../utils/phone';
import { MODAL_BACKDROP } from '../constants/styles';

const POLL_MS = 20000;

const QUOTE_STATUS_LABEL = { pending: 'En attente', quoted: 'Devis envoyé', accepted: 'Accepté', rejected: 'Refusé', modification_requested: 'Modification demandée' };
const QUOTE_STATUS_TONE = { pending: 'gray', quoted: 'blue', accepted: 'green', rejected: 'red', modification_requested: 'amber' };

/** Fil de discussion 1-à-1 — partagé entre l'espace client et prestataire. */
export default function MessageThread({ contactId, contactName }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [whatsapp, setWhatsapp] = useState(null);
  const [error, setError] = useState('');
  const [quotePicker, setQuotePicker] = useState(false);
  const [sharableQuotes, setSharableQuotes] = useState([]);
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try { setMessages(await getMessagesBetween(contactId)); } catch { /* silencieux */ }
  }, [contactId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
    getWhatsAppUnlock(contactId).then(setWhatsapp).catch(() => {});
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [load, contactId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await sendMessage({ recipient_id: contactId, content: text.trim() });
      setText('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleAttach = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled) return;
    setSending(true);
    try {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      const up = await uploadMessageAttachment({ uri: asset.uri, name: `photo.${extensionForMime(mimeType)}`, mimeType });
      await sendMessage({ recipient_id: contactId, attachment_url: up.url, attachment_type: up.attachment_type });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const openQuotePicker = async () => {
    setQuotePicker(true);
    try {
      const quotes = await getMyQuotes();
      setSharableQuotes(quotes.filter((q) => String(q.provider_id) === String(contactId) || String(q.client_id) === String(contactId)));
    } catch {
      setSharableQuotes([]);
    }
  };

  const shareQuote = async (quote) => {
    setQuotePicker(false);
    setSending(true);
    try {
      await sendMessage({ recipient_id: contactId, quote_id: quote.id, content: `📄 Devis partagé : ${quote.service_name}` });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingView />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-2">
          <ArrowLeft size={18} />
          <Avatar name={contactName} size="sm" />
          <Text className="font-semibold text-gray-900">{contactName}</Text>
        </Pressable>
        {whatsapp?.unlocked && whatsapp.phone ? (
          <Pressable
            onPress={() => Linking.openURL(`https://wa.me/${toWhatsAppRawNumber(whatsapp.phone)}`)}
            className="flex-row items-center gap-1 rounded-full bg-green-100 px-2.5 py-1"
          >
            <Phone size={12} color="#16a34a" />
            <Text className="text-xs font-semibold text-green-700">{whatsapp.phone}</Text>
          </Pressable>
        ) : null}
      </View>

      <Banner message={error} tone="error" />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.sender_id === user?.id;
          return (
            <View className={`mb-2 max-w-[80%] rounded-2xl px-3.5 py-2.5 ${mine ? 'self-end bg-amber-600' : 'self-start bg-white border border-gray-100'}`}>
              {item.attachment_type === 'image' && item.attachment_url ? (
                <Image source={{ uri: item.attachment_url }} className="mb-1 h-40 w-48 rounded-lg" resizeMode="cover" />
              ) : null}
              {item.quote_id ? (
                <View className={`mb-1 rounded-lg p-2 ${mine ? 'bg-amber-700' : 'bg-gray-50'}`}>
                  <View className="mb-1 flex-row items-center justify-between gap-2">
                    <Text className={`flex-1 text-xs font-bold ${mine ? 'text-white' : 'text-gray-900'}`} numberOfLines={1}>{item.quote_service_name}</Text>
                    <Badge label={QUOTE_STATUS_LABEL[item.quote_status] || item.quote_status} tone={QUOTE_STATUS_TONE[item.quote_status] || 'gray'} />
                  </View>
                  {item.quoted_price ? (
                    <Text className={`text-xs font-semibold ${mine ? 'text-amber-50' : 'text-amber-700'}`}>{formatFcfa(item.quoted_price)}</Text>
                  ) : null}
                </View>
              ) : null}
              {item.content ? <Text className={mine ? 'text-white' : 'text-gray-800'}>{item.content}</Text> : null}
              <Text className={`mt-1 text-[10px] ${mine ? 'text-amber-100' : 'text-gray-400'}`}>{formatRelativeTime(item.created_at)}</Text>
            </View>
          );
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-row items-center gap-2 border-t border-gray-100 bg-white p-3">
          <Pressable onPress={openQuotePicker} className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <FileText size={18} color="#4b5563" />
          </Pressable>
          <Pressable onPress={handleAttach} className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Paperclip size={18} color="#4b5563" />
          </Pressable>
          <Input
            value={text}
            onChangeText={setText}
            placeholder="Votre message..."
            containerClassName="mb-0 flex-1"
          />
          <Pressable onPress={handleSend} disabled={sending} className="h-10 w-10 items-center justify-center rounded-full bg-amber-600">
            <Send size={16} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={quotePicker} animationType="slide" transparent onRequestClose={() => setQuotePicker(false)}>
        <View className="flex-1 justify-end" style={MODAL_BACKDROP}>
          <View className="max-h-[70%] rounded-t-2xl bg-white p-5">
            <Text className="mb-3 text-lg font-bold text-gray-900">Partager un devis</Text>
            {sharableQuotes.length === 0 ? (
              <EmptyState icon={<FileText size={32} color="#9ca3af" />} title="Aucun devis avec ce contact" />
            ) : (
              <FlatList
                data={sharableQuotes}
                keyExtractor={(q) => String(q.id)}
                renderItem={({ item }) => (
                  <Pressable onPress={() => shareQuote(item)} className="mb-2 flex-row items-center justify-between rounded-xl border border-gray-100 px-3 py-3">
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>{item.service_name}</Text>
                      {item.quoted_price ? <Text className="text-xs text-amber-700">{formatFcfa(item.quoted_price)}</Text> : null}
                    </View>
                    <Badge label={QUOTE_STATUS_LABEL[item.status] || item.status} tone={QUOTE_STATUS_TONE[item.status] || 'gray'} />
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
