// Reprend frontend/src/utils/phoneFormatter.js::toWhatsAppRawNumber — même
// logique de normalisation pour que les liens wa.me se comportent pareil
// qu'sur le web (préfixe 225 Côte d'Ivoire).
export function toWhatsAppRawNumber(input = '', fallback = '2250799507067') {
  if (!input) return fallback;
  let digits = input.replace(/[^\d]/g, '');
  if (!digits.startsWith('225')) {
    digits = '225' + digits;
  }
  return digits.length >= 13 ? digits.slice(0, 13) : fallback;
}
