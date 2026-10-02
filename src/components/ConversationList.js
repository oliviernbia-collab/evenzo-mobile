import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from './Screen';
import Avatar from './Avatar';
import EmptyState from './EmptyState';
import LoadingView from './LoadingView';
import { MessageCircle, ArrowLeft } from './icons';
import { getConversations } from '../api/messages';
import { formatRelativeTime } from '../utils/format';

/** Liste des conversations — partagée entre l'espace client et prestataire. */
export default function ConversationList({ basePath, backHref }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setConversations(await getConversations()); } catch { setConversations([]); }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingView />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      {backHref ? (
        <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
          <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
        </Pressable>
      ) : null}
      <Text className="mb-4 text-xl font-bold text-gray-900">Messages</Text>

      {conversations.length === 0 ? (
        <EmptyState icon={<MessageCircle size={40} color="#9ca3af" />} title="Aucune conversation" />
      ) : conversations.map(({ contact, lastMessage, unreadCount }) => (
        <Pressable
          key={contact.id}
          onPress={() => router.push({ pathname: `${basePath}/messages/${contact.id}`, params: { name: contact.name } })}
          className="mb-2 flex-row items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
        >
          <Avatar name={contact.name} size="md" />
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-gray-900" numberOfLines={1}>{contact.name}</Text>
              {lastMessage ? <Text className="text-xs text-gray-400">{formatRelativeTime(lastMessage.created_at)}</Text> : null}
            </View>
            <Text className="text-sm text-gray-500" numberOfLines={1}>
              {lastMessage?.content || (lastMessage?.attachment_type === 'image' ? '📷 Photo' : 'Nouvelle conversation')}
            </Text>
          </View>
          {unreadCount > 0 ? (
            <View className="h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-600 px-1.5">
              <Text className="text-xs font-bold text-white">{unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
      ))}
    </Screen>
  );
}
