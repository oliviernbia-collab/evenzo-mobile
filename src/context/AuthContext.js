import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  hydrateTokensFromStorage, setOnSessionExpired, persistNewSession, logoutLocally,
} from '../api/client';
import { loginUser, registerUser, getMe, loginWithGoogle as loginWithGoogleApi } from '../api/auth';
import { saveSession } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setOnSessionExpired(() => setUser(null));
    (async () => {
      const session = await hydrateTokensFromStorage();
      if (session.accessToken && session.user) {
        setUser(session.user);
        // Rafraîchit le profil en tâche de fond (rôle/KYC/statut peuvent avoir changé).
        getMe().then((me) => {
          setUser((prev) => (prev ? { ...prev, ...me } : prev));
          saveSession({ user: { ...session.user, ...me } });
        }).catch(() => {});
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email, password, twoFAToken) => {
    const data = await loginUser({ email, password, twoFAToken });
    if (data.requires2FA) return { requires2FA: true };
    await persistNewSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
    setUser(data.user);
    return { user: data.user };
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const data = await loginWithGoogleApi(credential);
    await persistNewSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await registerUser(payload);
    await persistNewSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutLocally();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...patch } : prev;
      if (next) saveSession({ user: next });
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
  }), [user, isLoading, login, loginWithGoogle, register, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>');
  return ctx;
}
