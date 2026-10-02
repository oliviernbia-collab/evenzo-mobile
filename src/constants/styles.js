// Styles RN inline à utiliser à la place des classes Tailwind "shadow-*",
// "opacity-*" et "bg-*/NN" (couleur + opacité raccourcie, ex: bg-white/90,
// bg-black/40). Un bug connu de NativeWind déclenche une erreur "Couldn't
// find a navigation context" quand ces classes apparaissent — surtout
// basculées conditionnellement — dans un écran imbriqué sous Expo Router.
// Voir https://github.com/nativewind/nativewind/issues/1557
export const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 2,
  elevation: 1,
};

export const TAB_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 2,
  elevation: 1,
};

export const TRANSLUCENT_WHITE = { backgroundColor: 'rgba(255,255,255,0.9)' };
export const MODAL_BACKDROP = { backgroundColor: 'rgba(0,0,0,0.4)' };
export const DARK_OVERLAY_60 = { backgroundColor: 'rgba(0,0,0,0.6)' };
