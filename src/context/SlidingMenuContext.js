import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const SlidingMenuContext = createContext(null);

/** Permet à n'importe quel écran (client ou prestataire) d'ouvrir le menu coulissant de son espace. */
export function SlidingMenuProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <SlidingMenuContext.Provider value={value}>{children}</SlidingMenuContext.Provider>;
}

export function useSlidingMenu() {
  const ctx = useContext(SlidingMenuContext);
  if (!ctx) throw new Error('useSlidingMenu doit être utilisé à l\'intérieur de <SlidingMenuProvider>');
  return ctx;
}
