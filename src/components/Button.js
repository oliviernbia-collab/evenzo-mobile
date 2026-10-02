import { Pressable, Text, ActivityIndicator, View } from 'react-native';

const VARIANTS = {
  primary: 'bg-amber-600 active:bg-amber-700',
  secondary: 'bg-white border border-gray-300 active:bg-gray-50',
  danger: 'bg-red-600 active:bg-red-700',
  ghost: 'bg-transparent',
};
const TEXT_VARIANTS = {
  primary: 'text-white',
  secondary: 'text-gray-900',
  danger: 'text-white',
  ghost: 'text-amber-700',
};

export default function Button({ title, onPress, variant = 'primary', loading, disabled, icon, className = '', style }) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[isDisabled ? { opacity: 0.5 } : null, style]}
      className={`flex-row items-center justify-center gap-2 rounded-xl px-4 py-3.5 ${VARIANTS[variant]} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#92400e' : '#fff'} />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <Text className={`font-semibold text-base ${TEXT_VARIANTS[variant]}`}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
