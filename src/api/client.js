import { API_BASE_URL } from '../constants/config';
import { getSession, saveSession, saveAccessToken, clearSession } from '../utils/storage';

// Token d'accès gardé en mémoire pour éviter une lecture SecureStore à
// chaque requête ; initialisé une fois au démarrage par AuthContext.
let memoryAccessToken = null;
let memoryRefreshToken = null;
let pendingRefresh = null;
let onSessionExpired = null;

export function setTokens({ accessToken, refreshToken } = {}) {
  if (accessToken !== undefined) memoryAccessToken = accessToken;
  if (refreshToken !== undefined) memoryRefreshToken = refreshToken;
}

export function setOnSessionExpired(callback) {
  onSessionExpired = callback;
}

export async function hydrateTokensFromStorage() {
  const session = await getSession();
  memoryAccessToken = session.accessToken;
  memoryRefreshToken = session.refreshToken;
  return session;
}

async function refreshAccessToken() {
  if (!memoryRefreshToken) throw new Error('NO_REFRESH_TOKEN');
  if (!pendingRefresh) {
    pendingRefresh = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: memoryRefreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('REFRESH_FAILED');
        const data = await res.json();
        memoryAccessToken = data.accessToken;
        if (data.refreshToken) memoryRefreshToken = data.refreshToken;
        await saveSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        return data.accessToken;
      })
      .finally(() => {
        pendingRefresh = null;
      });
  }
  return pendingRefresh;
}

async function handleSessionExpired() {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  await clearSession();
  if (onSessionExpired) onSessionExpired();
}

/**
 * Wrapper fetch() avec Authorization Bearer + rafraîchissement silencieux
 * sur expiration (code TOKEN_EXPIRED), même logique que
 * frontend/src/services/dataService.js::apiFetch, adaptée au stockage
 * mobile (SecureStore, pas de cookie httpOnly).
 */
export async function apiFetch(endpoint, options = {}, isRetry = false) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (memoryAccessToken) headers.Authorization = `Bearer ${memoryAccessToken}`;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (res.status === 401 && data?.code === 'TOKEN_EXPIRED' && !isRetry) {
    try {
      await refreshAccessToken();
      return apiFetch(endpoint, options, true);
    } catch {
      await handleSessionExpired();
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (res.status === 401 && !isRetry) {
    await handleSessionExpired();
  }

  if (!res.ok) {
    const message = data?.message || 'Une erreur est survenue.';
    const error = new Error(message);
    error.status = res.status;
    error.code = data?.code;
    error.data = data;
    throw error;
  }

  return data;
}

export function apiGet(endpoint) {
  return apiFetch(endpoint, { method: 'GET' });
}
export function apiPost(endpoint, body) {
  return apiFetch(endpoint, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
}
export function apiPut(endpoint, body) {
  return apiFetch(endpoint, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined });
}
export function apiDelete(endpoint) {
  return apiFetch(endpoint, { method: 'DELETE' });
}

/**
 * Upload multipart (avatar, portfolio, KYC, pièces jointes...). `fileField`
 * est le nom de champ attendu par le backend (ex: "avatar", "photos").
 * `file` = { uri, name, type } fourni par expo-image-picker/document-picker.
 */
export async function apiUpload(endpoint, { fileField, file, files, fields } = {}) {
  const formData = new FormData();
  if (file) {
    formData.append(fileField, { uri: file.uri, name: file.name || 'upload.jpg', type: file.mimeType || file.type || 'image/jpeg' });
  }
  if (files && Array.isArray(files)) {
    files.forEach((f) => {
      formData.append(fileField, { uri: f.uri, name: f.name || 'upload.jpg', type: f.mimeType || f.type || 'image/jpeg' });
    });
  }
  if (fields) {
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
  }

  const headers = {};
  if (memoryAccessToken) headers.Authorization = `Bearer ${memoryAccessToken}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers, body: formData });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const error = new Error(data?.message || "Échec de l'envoi du fichier.");
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function persistNewSession({ accessToken, refreshToken, user }) {
  setTokens({ accessToken, refreshToken });
  await saveSession({ accessToken, refreshToken, user });
}

export async function logoutLocally() {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  await clearSession();
}

export { saveAccessToken };
