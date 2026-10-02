// Devine l'extension de fichier à partir d'un mimetype — utilisé pour nommer
// les fichiers envoyés en upload de façon cohérente avec leur contenu réel.
const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function extensionForMime(mimeType) {
  return EXTENSIONS[mimeType] || 'jpg';
}
