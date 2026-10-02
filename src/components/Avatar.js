import { View, Text, Image } from 'react-native';
import { getInitials, getAvatarColor } from '../utils/format';

const SIZES = { sm: 32, md: 48, lg: 64, xl: 96 };

export default function Avatar({ uri, name, size = 'md' }) {
  const px = SIZES[size] || size;
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: px, height: px, borderRadius: px / 2 }}
        className="bg-gray-200"
      />
    );
  }
  return (
    <View
      style={{ width: px, height: px, borderRadius: px / 2, backgroundColor: getAvatarColor(name) }}
      className="items-center justify-center"
    >
      <Text style={{ fontSize: px * 0.38 }} className="font-bold text-white">{getInitials(name)}</Text>
    </View>
  );
}
