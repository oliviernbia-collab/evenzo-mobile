import { apiGet, apiPut } from './client';

export const getNotifications = () => apiGet('/notifications');
export const getUnreadNotificationCount = () => apiGet('/notifications/unread-count');
export const markNotificationRead = (id) => apiPut(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => apiPut('/notifications/read-all');
