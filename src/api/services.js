import { apiGet, apiPost, apiPut, apiDelete } from './client';

export const getServicesForProvider = (providerId) => apiGet(`/services/${providerId}`);
export const createService = (payload) => apiPost('/services', payload);
export const updateService = (id, payload) => apiPut(`/services/${id}`, payload);
export const deleteService = (id) => apiDelete(`/services/${id}`);
