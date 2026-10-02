import { View, Text } from 'react-native';

export default function Logo({ size = 40 }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
      className="items-center justify-center bg-amber-600"
    >
      <Text style={{ fontSize: size * 0.48 }} className="font-extrabold text-white">E</Text>
    </View>
  );
}
