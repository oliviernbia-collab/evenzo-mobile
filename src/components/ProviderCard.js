import { View, Text, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import Avatar from './Avatar';
import StarRating from './StarRating';
import Badge from './Badge';
import { Heart, HeartFilled, MapPin, Check } from './icons';
import { formatFcfa } from '../utils/format';
import { CARD_SHADOW, TRANSLUCENT_WHITE } from '../constants/styles';

export default function ProviderCard({ provider, isFavorite, onToggleFavorite, basePath, isComparing, onToggleCompare }) {
  const cover = provider.portfolio?.[0]?.url_medium || provider.avatar;

  return (
    <Pressable
      onPress={() => router.push(`${basePath}/provider/${provider.id}`)}
      className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white"
      style={CARD_SHADOW}
    >
      <View className="relative h-40 w-full bg-gray-100">
        {cover ? (
          <Image source={{ uri: cover }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Avatar name={provider.name} size="lg" />
          </View>
        )}
        <Pressable
          onPress={(e) => { e.stopPropagation(); onToggleFavorite?.(provider.id); }}
          className="absolute right-2 top-2 h-9 w-9 items-center justify-center rounded-full"
          style={TRANSLUCENT_WHITE}
        >
          {isFavorite ? <HeartFilled color="#dc2626" size={18} /> : <Heart color="#374151" size={18} />}
        </Pressable>
        {provider.provider_tier === 'pro' ? (
          <View className="absolute left-2 top-2"><Badge label="Pro" tone="amber" /></View>
        ) : null}
      </View>

      <View className="p-3">
        <View className="flex-row items-center gap-2">
          <Avatar uri={provider.avatar} name={provider.name} size="sm" />
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="flex-1 font-semibold text-gray-900" numberOfLines={1}>{provider.name}</Text>
              {provider.kyc_badge ? <Badge label="Vérifié" tone="green" /> : null}
            </View>
            <Text className="text-xs text-gray-500" numberOfLines={1}>{provider.category}</Text>
          </View>
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          <StarRating rating={provider.rating} reviewCount={provider.review_count} />
          {provider.city ? (
            <View className="flex-row items-center gap-1">
              <MapPin size={12} color="#6b7280" />
              <Text className="text-xs text-gray-500" numberOfLines={1}>{provider.commune || provider.city}</Text>
            </View>
          ) : null}
        </View>

        {provider.starting_price ? (
          <Text className="mt-2 text-sm font-semibold text-amber-700">
            Dès {formatFcfa(provider.starting_price)}
          </Text>
        ) : null}

        {onToggleCompare ? (
          <Pressable
            onPress={(e) => { e.stopPropagation(); onToggleCompare(provider); }}
            className="mt-3 flex-row items-center gap-2 self-start"
          >
            <View className={`h-5 w-5 items-center justify-center rounded-md border ${isComparing ? 'border-amber-600 bg-amber-600' : 'border-gray-300'}`}>
              {isComparing ? <Check size={12} color="#fff" /> : null}
            </View>
            <Text className="text-xs text-gray-500">Comparer</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
