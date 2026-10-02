import { apiGet, apiPost, apiPut, apiDelete } from './client';

export const getCart = () => apiGet('/cart');
export const addToCart = (item) => apiPost('/cart', item);
export const updateCartItem = (id, payload) => apiPut(`/cart/${id}`, payload);
export const removeCartItem = (id) => apiDelete(`/cart/${id}`);
export const clearCart = () => apiDelete('/cart');

export const ESCROW_FEE_RATE = 0.05;
export function calculateCartTotals(items, discountAmount = 0) {
  const subtotal = items.reduce((sum, it) => sum + (Number(it.service_price) || 0) * (Number(it.quantity) || 1), 0);
  const escrowFee = Math.round(subtotal * ESCROW_FEE_RATE);
  const total = Math.max(0, subtotal + escrowFee - discountAmount);
  return { subtotal, escrowFee, discountAmount, total };
}
