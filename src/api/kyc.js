import { apiGet, apiPost, apiUpload } from './client';

export const submitKycDocuments = (payload) => apiPost('/kyc/submit', payload);
export const getKycStatus = () => apiGet('/kyc/status');
export const uploadKycDocument = (file, side) => apiUpload('/upload/kyc-document', { fileField: 'document', file, fields: { side } });

export const KYC_DOCUMENT_TYPES = [
  { value: 'CNI', label: "Carte Nationale d'Identité" },
  { value: 'PASSEPORT', label: 'Passeport' },
  { value: 'CARTE_SEJOUR', label: 'Carte de séjour' },
  { value: 'RCCM', label: 'Registre de Commerce (RCCM)' },
];
