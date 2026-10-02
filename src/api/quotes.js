import { apiGet, apiPost, apiPut } from './client';

export const createQuoteRequest = (payload) => apiPost('/quotes', payload);
export const getMyQuotes = () => apiGet('/quotes');
export const respondToQuote = (id, payload) => apiPut(`/quotes/${id}/respond`, payload);
export const updateQuoteStatus = (id, status) => apiPut(`/quotes/${id}/status`, { status });
