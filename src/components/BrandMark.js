import { View, Image } from 'react-native';

const SOURCE = require('../../assets/evenzo-logo.png');

// Mesures faites par analyse directe des pixels du fichier (carré, 1254×1254) :
// le mot "Evenzo" commence dès y≈0.586 de la hauteur, sur la gauche — avant
// même que le bas de l'icône (le "C" + silhouettes + ruban + étincelle) ne
// se termine à droite. Icône et texte se chevauchent donc verticalement :
// aucun ratio de cadrage rectangulaire "toute la largeur" ne peut montrer
// l'icône en entier sans risquer un bout de texte. La fenêtre ci-dessous est
// recentrée sur l'icône seule (vérifiée visuellement) : elle inclut l'anneau,
// les silhouettes, le ruban et l'étincelle, sans aucune lettre.
const CROP = 0.52;     // fraction (carrée) de l'image visible
const OFFSET_X = 0.245; // départ du cadrage, fraction de la largeur
const OFFSET_Y = 0.06;  // départ du cadrage, fraction de la hauteur

/** Logo Evenzo — icône seule (sans le texte intégré à l'image source). */
export default function BrandMark({ size = 96 }) {
  const imageSize = size / CROP;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.18, overflow: 'hidden' }}>
      <Image
        source={SOURCE}
        style={{
          width: imageSize,
          height: imageSize,
          marginLeft: -OFFSET_X * imageSize,
          marginTop: -OFFSET_Y * imageSize,
        }}
        resizeMode="cover"
      />
    </View>
  );
}
