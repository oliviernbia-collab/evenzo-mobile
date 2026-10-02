import { apiPost } from './client';

export const sendContactMessage = (payload) => apiPost('/contact', payload);
