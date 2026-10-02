import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'evenzo_access_token',
  refreshToken: 'evenzo_refresh_token',
  user: 'evenzo_user',
};

export async function getSession() {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    SecureStore.getItemAsync(KEYS.accessToken),
    SecureStore.getItemAsync(KEYS.refreshToken),
    SecureStore.getItemAsync(KEYS.user),
  ]);
  return {
    accessToken,
    refreshToken,
    user: userRaw ? JSON.parse(userRaw) : null,
  };
}

export async function saveSession({ accessToken, refreshToken, user }) {
  await Promise.all([
    accessToken ? SecureStore.setItemAsync(KEYS.accessToken, accessToken) : Promise.resolve(),
    refreshToken ? SecureStore.setItemAsync(KEYS.refreshToken, refreshToken) : Promise.resolve(),
    user ? SecureStore.setItemAsync(KEYS.user, JSON.stringify(user)) : Promise.resolve(),
  ]);
}

export async function saveAccessToken(accessToken) {
  await SecureStore.setItemAsync(KEYS.accessToken, accessToken);
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.accessToken),
    SecureStore.deleteItemAsync(KEYS.refreshToken),
    SecureStore.deleteItemAsync(KEYS.user),
  ]);
}
