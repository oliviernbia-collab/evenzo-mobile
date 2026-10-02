import { apiGet, apiPost, apiFetch } from './client';

export const get2FAStatus = () => apiGet('/2fa/status');
export const setup2FA = () => apiPost('/2fa/setup');
export const verify2FASetup = (token) => apiPost('/2fa/verify-setup', { token });
export const disable2FA = (token) => apiFetch('/2fa/disable', { method: 'DELETE', body: JSON.stringify({ token }) });
