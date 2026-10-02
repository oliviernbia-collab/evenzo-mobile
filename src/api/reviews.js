import { apiGet, apiPost } from './client';

export const getReviewsForProvider = (providerId) => apiGet(`/reviews/${providerId}`);
export const addProviderReview = (payload) => apiPost('/reviews', payload);
