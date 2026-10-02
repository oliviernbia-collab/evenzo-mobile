import { View, Text } from 'react-native';

// Classes Tailwind complètes et statiques par ton (NativeWind scanne le code
// source littéralement : une classe construite dynamiquement, ex.
// `text-${color}`, ne serait jamais détectée et resterait sans style).
const TONES = {
  amber: { bg: 'bg-amber-100', text: 'text-amber-800' },
  green: { bg: 'bg-green-100', text: 'text-green-800' },
  red: { bg: 'bg-red-100', text: 'text-red-800' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
};

export default function Badge({ label, tone = 'gray', icon }) {
  const { bg, text } = TONES[tone] || TONES.gray;
  return (
    <View className={`flex-row items-center gap-1 self-start rounded-full px-2.5 py-1 ${bg}`}>
      {icon}
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
