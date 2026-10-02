import { View, ActivityIndicator, Text } from 'react-native';

export default function LoadingView({ label }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-gray-50 py-16">
      <ActivityIndicator size="large" color="#d97706" />
      {label ? <Text className="text-sm text-gray-500">{label}</Text> : null}
    </View>
  );
}
