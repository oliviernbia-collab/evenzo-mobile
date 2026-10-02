import { apiGet, apiPost, apiDelete } from './client';

export const getFavoriteIds = () => apiGet('/favorites');
export const addFavorite = (providerId) => apiPost('/favorites', { provider_id: providerId });
export const removeFavorite = (providerId) => apiDelete(`/favorites/${providerId}`);
