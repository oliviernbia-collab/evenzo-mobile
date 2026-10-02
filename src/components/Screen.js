import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Conteneur plein écran avec safe-area + scroll optionnel, réutilisé partout. */
export default function Screen({ children, scroll = true, onRefresh, refreshing, className = '', contentClassName = '', edges }) {
  const content = scroll ? (
    <ScrollView
      className={`flex-1 ${className}`}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#d97706" /> : undefined}
    >
      <View className={`p-4 ${contentClassName}`}>{children}</View>
    </ScrollView>
  ) : (
    <View className={`flex-1 ${className}`}>{children}</View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={edges || ['top', 'left', 'right']}>
      {content}
    </SafeAreaView>
  );
}
