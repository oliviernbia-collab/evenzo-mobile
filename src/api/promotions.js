import { apiGet, apiPost } from './client';

export const getActivePromotions = () => apiGet('/promotions/active');
export const validatePromoCode = (code, items) => apiPost('/promotions/validate', { code, items });
