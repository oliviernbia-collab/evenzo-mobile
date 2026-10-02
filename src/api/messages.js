import { apiGet, apiPost, apiUpload } from './client';

export const getConversations = () => apiGet('/conversations');
export const getMessagesBetween = (contactId) => apiGet(`/messages/${contactId}`);
export const getUnreadMessageCount = () => apiGet('/messages/unread-count');
export const getWhatsAppUnlock = (contactId) => apiGet(`/messages/${contactId}/whatsapp`);
export const sendMessage = (payload) => apiPost('/messages', payload);
export const uploadMessageAttachment = (file) => apiUpload('/upload/message-attachment', { fileField: 'document', file });
