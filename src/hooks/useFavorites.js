import { useState, useEffect, useCallback } from 'react';
import { getFavoriteIds, addFavorite, removeFavorite } from '../api/favorites';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    try {
      const ids = await getFavoriteIds();
      setFavoriteIds(ids.map(String));
    } catch {
      // Silencieux : les favoris ne sont pas critiques pour l'affichage.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const toggle = useCallback(async (providerId) => {
    const id = String(providerId);
    const isFav = favoriteIds.includes(id);
    setFavoriteIds((prev) => (isFav ? prev.filter((f) => f !== id) : [...prev, id]));
    try {
      if (isFav) await removeFavorite(providerId);
      else await addFavorite(providerId);
    } catch {
      setFavoriteIds((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)));
    }
  }, [favoriteIds]);

  return { favoriteIds, loaded, toggle, reload };
}
