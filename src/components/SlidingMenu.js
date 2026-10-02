import { useEffect, useRef } from 'react';
import { Modal, Pressable, View, Text, Animated, ScrollView } from 'react-native';
import { router, usePathname } from 'expo-router';
import Avatar from './Avatar';
import { LogOut, X } from './icons';
import { useAuth } from '../context/AuthContext';
import { useSlidingMenu } from '../context/SlidingMenuContext';
import { MODAL_BACKDROP } from '../constants/styles';

const PANEL_WIDTH = 288;

/**
 * Menu latéral coulissant — équivalent mobile de la DashboardSidebar web.
 * Même composant pour l'espace client et l'espace prestataire : seule la
 * liste `items` change (voir constants/menuItems.js).
 */
export default function SlidingMenu({ items }) {
  const { isOpen, close } = useSlidingMenu();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const translateX = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -PANEL_WIDTH,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [isOpen, translateX]);

  const go = (href) => {
    close();
    if (href !== pathname) router.push(href);
  };

  const handleLogout = async () => {
    close();
    await logout();
    router.replace('/login');
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={close}>
      <View className="flex-1 flex-row">
        <Animated.View
          style={{ width: PANEL_WIDTH, transform: [{ translateX }] }}
          className="h-full bg-white"
        >
          <ScrollView contentContainerStyle={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 16 }}>
            <View className="mb-6 flex-row items-center gap-3">
              <Avatar uri={user?.avatar} name={user?.name} size="md" />
              <View className="flex-1">
                <Text className="font-semibold text-gray-900" numberOfLines={1}>{user?.name}</Text>
                <Text className="text-xs text-gray-500" numberOfLines={1}>{user?.category || user?.city || user?.email}</Text>
              </View>
              <Pressable onPress={close} hitSlop={8}>
                <X size={20} color="#6b7280" />
              </Pressable>
            </View>

            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Pressable
                  key={item.href}
                  onPress={() => go(item.href)}
                  className={`mb-1 flex-row items-center gap-3 rounded-xl px-3 py-3 ${active ? 'bg-amber-50' : ''}`}
                >
                  <Icon size={18} color={active ? '#b45309' : '#4b5563'} />
                  <Text className={`text-sm font-medium ${active ? 'text-amber-800' : 'text-gray-700'}`}>{item.label}</Text>
                </Pressable>
              );
            })}

            <Pressable onPress={handleLogout} className="mt-4 flex-row items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3">
              <LogOut size={18} color="#dc2626" />
              <Text className="text-sm font-semibold text-red-600">Se déconnecter</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>

        <Pressable style={{ flex: 1 }} onPress={close}>
          <View style={MODAL_BACKDROP} className="flex-1" />
        </Pressable>
      </View>
    </Modal>
  );
}
