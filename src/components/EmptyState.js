import { View, Text } from 'react-native';
import Button from './Button';

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      {icon}
      <Text className="mt-4 text-center text-lg font-semibold text-gray-900">{title}</Text>
      {description ? <Text className="mt-1 text-center text-sm text-gray-500">{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} className="mt-5 px-6" />
      ) : null}
    </View>
  );
}
