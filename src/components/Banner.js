import { View, Text } from 'react-native';

const TONES = {
  error: 'border-red-200 bg-red-50',
  success: 'border-green-200 bg-green-50',
  info: 'border-blue-200 bg-blue-50',
  warning: 'border-amber-200 bg-amber-50',
};
const TEXT_TONES = {
  error: 'text-red-700',
  success: 'text-green-700',
  info: 'text-blue-700',
  warning: 'text-amber-800',
};

export default function Banner({ message, tone = 'info' }) {
  if (!message) return null;
  return (
    <View className={`mb-4 rounded-xl border px-4 py-3 ${TONES[tone] || TONES.info}`}>
      <Text className={`text-sm ${TEXT_TONES[tone] || TEXT_TONES.info}`}>{message}</Text>
    </View>
  );
}
