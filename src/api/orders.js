import { apiGet, apiPost, apiPut } from './client';

export const previewOrderTotals = (items, promoCode) => apiPost('/orders/preview', { items, promo_code: promoCode || undefined });
export const createOrder = (payload) => apiPost('/orders', payload);
export const getMyOrders = () => apiGet('/orders');
export const respondToOrder = (id, response) => apiPut(`/orders/${id}/provider-response`, { response });
