import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../../components/Screen';
import TopBar from '../../../components/TopBar';
import Avatar from '../../../components/Avatar';
import Banner from '../../../components/Banner';
import {
  FileText, ShoppingCart, MessageCircle, Bell, ShieldCheck, LogOut, ChevronRight, Lock, Mail,
} from '../../../components/icons';
import { useAuth } from '../../../context/AuthContext';

function MenuItem({ icon, label, onPress, danger }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between border-b border-gray-50 py-3.5">
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>{label}</Text>
      </View>
      {!danger ? <ChevronRight size={16} color="#9ca3af" /> : null}
    </Pressable>
  );
}

export default function ClientAccountScreen() {
  const { user, logout } = useAuth();
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try { await logout(); router.replace('/login'); } catch (err) { setError(err.message); }
  };

  return (
    <Screen>
      <TopBar title="Mon compte" />
      <View className="mb-6 items-center">
        <Avatar uri={user?.avatar} name={user?.name} size="xl" />
        <Text className="mt-3 text-lg font-bold text-gray-900">{user?.name}</Text>
        <Text className="text-sm text-gray-500">{user?.email}</Text>
      </View>

      <Banner message={error} tone="error" />

      <View className="mb-4 rounded-xl border border-gray-100 bg-white px-4">
        <MenuItem icon={<FileText size={18} color="#4b5563" />} label="Mes devis" onPress={() => router.push('/client/quotes')} />
        <MenuItem icon={<ShoppingCart size={18} color="#4b5563" />} label="Mes commandes" onPress={() => router.push('/client/orders')} />
        <MenuItem icon={<ShieldCheck size={18} color="#4b5563" />} label="Paiements sécurisés" onPress={() => router.push('/client/escrow')} />
        <MenuItem icon={<MessageCircle size={18} color="#4b5563" />} label="Messages" onPress={() => router.push('/client/messages')} />
        <MenuItem icon={<Bell size={18} color="#4b5563" />} label="Notifications" onPress={() => router.push('/client/notifications')} />
      </View>

      <View className="mb-6 rounded-xl border border-gray-100 bg-white px-4">
        <MenuItem icon={<Lock size={18} color="#4b5563" />} label="Modifier mon profil" onPress={() => router.push('/client/profile-edit')} />
        <MenuItem icon={<Mail size={18} color="#4b5563" />} label="Contacter le support" onPress={() => router.push('/contact')} />
      </View>

      <Pressable onPress={handleLogout} className="mb-8 flex-row items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3.5">
        <LogOut size={18} color="#dc2626" />
        <Text className="font-semibold text-red-600">Se déconnecter</Text>
      </Pressable>
    </Screen>
  );
}
