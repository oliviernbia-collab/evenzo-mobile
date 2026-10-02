import { apiGet, apiDelete, apiUpload } from './client';

export const uploadAvatar = (file) => apiUpload('/upload/avatar', { fileField: 'avatar', file });
export const uploadPortfolioPhotos = (files, caption) => apiUpload('/upload/portfolio', { fileField: 'photos', files, fields: { caption } });
export const getPortfolio = (providerId) => apiGet(`/upload/portfolio/${providerId}`);
export const deletePortfolioPhoto = (id) => apiDelete(`/upload/portfolio/${id}`);
export const uploadPaymentScreenshot = (file) => apiUpload('/upload/payment-screenshot', { fileField: 'screenshot', file });
export const uploadDisputeEvidence = (file) => apiUpload('/upload/dispute-evidence', { fileField: 'document', file });
