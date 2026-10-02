import { View, Text } from 'react-native';
import { Star, StarOutline } from './icons';

export default function StarRating({ rating = 0, reviewCount, size = 14, showValue = true }) {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((i) => (
          i <= rounded
            ? <Star key={i} size={size} color="#f59e0b" />
            : <StarOutline key={i} size={size} color="#d1d5db" />
        ))}
      </View>
      {showValue ? (
        <Text className="text-xs text-gray-600">
          {Number(rating || 0).toFixed(1)}{reviewCount !== undefined ? ` (${reviewCount})` : ''}
        </Text>
      ) : null}
    </View>
  );
}
