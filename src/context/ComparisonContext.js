import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ComparisonContext = createContext(null);
const MAX_COMPARE = 3;

/** Sélection de prestataires à comparer (jusqu'à 3) — équivalent du comparateur web. */
export function ComparisonProvider({ children }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggle = useCallback((provider) => {
    const id = String(provider.id);
    setSelectedIds((prev) => {
      if (prev.some((p) => p.id === id)) return prev.filter((p) => p.id !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, { id, name: provider.name }];
    });
  }, []);

  const clear = useCallback(() => setSelectedIds([]), []);
  const isSelected = useCallback((id) => selectedIds.some((p) => p.id === String(id)), [selectedIds]);

  const value = useMemo(() => ({ selectedIds, toggle, clear, isSelected, maxReached: selectedIds.length >= MAX_COMPARE }), [selectedIds, toggle, clear, isSelected]);
  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
}

export function useComparison() {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error('useComparison doit être utilisé à l\'intérieur de <ComparisonProvider>');
  return ctx;
}
