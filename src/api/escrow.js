import { apiGet, apiPost } from './client';

export const initiateEscrow = (payload) => apiPost('/escrow/initiate', payload);
export const confirmEscrow = (id) => apiPost(`/escrow/confirm/${id}`);
export const cancelEscrowAsClient = (id) => apiPost(`/escrow/${id}/cancel-by-client`);
export const cancelEscrowAsProvider = (id, reason) => apiPost(`/escrow/${id}/cancel-by-provider`, { reason });
export const reportClientNoShow = (id, details) => apiPost(`/escrow/${id}/report-no-show`, { details });
export const disputeEscrow = (id, payload) => apiPost(`/escrow/dispute/${id}`, payload);
export const respondToDispute = (id, payload) => apiPost(`/escrow/dispute/${id}/respond`, payload);
export const getMyEscrowTransactions = () => apiGet('/escrow/my-transactions');

export const DISPUTE_MOTIFS = [
  { value: 'prestation_non_realisee', label: 'Prestation non réalisée' },
  { value: 'retard_important', label: 'Retard important' },
  { value: 'prestation_differente', label: 'Prestation différente de ce qui était convenu' },
  { value: 'mauvaise_qualite', label: 'Mauvaise qualité' },
  { value: 'prestataire_absent', label: 'Prestataire absent' },
  { value: 'probleme_quantite', label: 'Problème de quantité' },
  { value: 'probleme_materiel', label: 'Problème de matériel' },
  { value: 'autre', label: 'Autre' },
];
