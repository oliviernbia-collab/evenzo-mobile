import { apiGet, apiPut, apiPost, apiDelete } from './client';

export function getProviders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'Tous') params.set('category', filters.category);
  if (filters.q) params.set('q', filters.q);
  if (filters.city) params.set('city', filters.city);
  const qs = params.toString();
  return apiGet(`/providers${qs ? `?${qs}` : ''}`);
}

export const getProviderById = (id) => apiGet(`/providers/${id}`);
export const getProviderContact = (id) => apiGet(`/providers/${id}/contact`);
export const updateProviderProfile = (id, payload) => apiPut(`/providers/${id}`, payload);
export const getMySubscriptionStatus = () => apiGet('/providers/me/subscription-status');
export const getMyProviderStats = () => apiGet('/providers/me/stats');
export const getMyAvailability = () => apiGet('/providers/me/availability');
export const blockAvailabilityDate = (date) => apiPost('/providers/me/availability', { date });
export const unblockAvailabilityDate = (date) => apiDelete(`/providers/me/availability/${date}`);
export const getPublicAvailability = (id) => apiGet(`/providers/${id}/availability`);

// Pas d'endpoint dédié côté backend — même logique que
// frontend/src/services/dataService.js (filtrage côté client sur la liste publique).
export async function getSimilarProviders(providerId, category, limit = 4) {
  const all = await getProviders();
  return all.filter((p) => p.id !== providerId && p.category?.toLowerCase() === category?.toLowerCase()).slice(0, limit);
}

export async function getComplementaryProviders(currentCategory, limit = 4) {
  const all = await getProviders();
  return all.filter((p) => p.category?.toLowerCase() !== currentCategory?.toLowerCase()).slice(0, limit);
}
