import { View, Text, Pressable } from 'react-native';
import { Menu } from './icons';
import { useSlidingMenu } from '../context/SlidingMenuContext';

/** Barre de titre avec bouton ☰ pour ouvrir le menu coulissant (client ou pro). */
export default function TopBar({ title, right }) {
  const { open } = useSlidingMenu();
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center gap-3">
        <Pressable onPress={open} className="h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white">
          <Menu size={18} color="#374151" />
        </Pressable>
        <Text className="flex-1 text-xl font-bold text-gray-900" numberOfLines={1}>{title}</Text>
      </View>
      {right}
    </View>
  );
}
