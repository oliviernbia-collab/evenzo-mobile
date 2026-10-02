import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Eye, EyeOff } from './icons';

export default function Input({ label, error, containerClassName = '', secureTextEntry, ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label ? <Text className="mb-1.5 text-sm font-medium text-gray-700">{label}</Text> : null}
      <View className="relative justify-center">
        <TextInput
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !visible}
          className={`rounded-xl border px-4 py-3 text-base text-gray-900 ${isPassword ? 'pr-11' : ''} ${error ? 'border-red-400' : 'border-gray-300'}`}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            className="absolute right-3"
            hitSlop={8}
          >
            {visible ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="mt-1 text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
