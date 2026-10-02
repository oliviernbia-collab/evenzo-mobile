import { apiGet, apiPost } from './client';

export const registerUser = (payload) => apiPost('/auth/register', payload);
export const loginUser = (payload) => apiPost('/auth/login', payload);
export const loginWithGoogle = (credential) => apiPost('/auth/google', { credential });
export const getMe = () => apiGet('/auth/me');
export const acceptTerms = () => apiPost('/auth/accept-terms');
export const requestPasswordReset = (payload) => apiPost('/auth/forgot-password', payload);
export const verifyResetCode = (payload) => apiPost('/auth/verify-reset-code', payload);
export const completePasswordReset = (payload) => apiPost('/auth/reset-password', payload);
export const changePassword = (payload) => apiPost('/auth/change-password', payload);
