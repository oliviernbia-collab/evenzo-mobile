import { useState, useEffect, useCallback } from 'react';
import { getMySubscriptionStatus } from '../api/providers';

/** Statut essai gratuit / abonnement du prestataire connecté. */
export function useProviderAccess() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try { setStatus(await getMySubscriptionStatus()); } catch { setStatus(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { status, loading, reload, isLocked: status ? !status.active : false };
}
