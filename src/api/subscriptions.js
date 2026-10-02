import { apiGet, apiPost } from './client';

export const WAVE_PAYMENT_NUMBER = '05 54 18 33 78';

export const getSubscriptionPlans = () => apiGet('/payment/plans');
export const getMySubscription = () => apiGet('/payment/my-subscription');
export const submitManualPayment = (payload) => apiPost('/payment/manual/submit', payload);
export const getMyManualPaymentSubmissions = () => apiGet('/payment/manual/my-submissions');
