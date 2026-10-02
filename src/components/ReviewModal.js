import { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import Input from './Input';
import Button from './Button';
import Banner from './Banner';
import { Star, StarOutline } from './icons';
import { addProviderReview } from '../api/reviews';
import { MODAL_BACKDROP } from '../constants/styles';

const CRITERIA = [
  { key: 'professionalism', label: 'Professionnalisme' },
  { key: 'work_quality', label: 'Qualité de la prestation' },
  { key: 'punctuality', label: 'Ponctualité' },
  { key: 'communication', label: 'Communication' },
  { key: 'value_for_money', label: 'Rapport qualité/prix' },
];

function StarPicker({ value, onChange }) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} hitSlop={4}>
          {n <= value ? <Star size={22} color="#f59e0b" /> : <StarOutline size={22} color="#d1d5db" />}
        </Pressable>
      ))}
    </View>
  );
}

/** Formulaire d'avis vérifié (5 critères) — ouvert depuis une commande confirmée ou un paiement sécurisé libéré. */
export default function ReviewModal({ visible, providerId, providerName, onClose, onSubmitted }) {
  const [scores, setScores] = useState({});
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setScore = (key, value) => setScores((prev) => ({ ...prev, [key]: value }));
  const hasAnyScore = Object.values(scores).some((v) => v > 0);

  const handleSubmit = async () => {
    if (!hasAnyScore) {
      setError('Donnez au moins une note.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await addProviderReview({ provider_id: providerId, comment, ...scores });
      setScores({});
      setComment('');
      onSubmitted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={MODAL_BACKDROP}>
        <View className="max-h-[85%] rounded-t-2xl bg-white p-5">
          <Text className="mb-1 text-lg font-bold text-gray-900">Laisser un avis</Text>
          <Text className="mb-4 text-sm text-gray-500">{providerName}</Text>

          <Banner message={error} tone="error" />

          {CRITERIA.map((c) => (
            <View key={c.key} className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm text-gray-700">{c.label}</Text>
              <StarPicker value={scores[c.key] || 0} onChange={(v) => setScore(c.key, v)} />
            </View>
          ))}

          <Input label="Votre commentaire (optionnel)" value={comment} onChangeText={setComment} multiline numberOfLines={4} placeholder="Partagez votre expérience..." />

          <View className="flex-row gap-2">
            <Button title="Annuler" variant="secondary" onPress={onClose} className="flex-1" />
            <Button title="Publier l'avis" onPress={handleSubmit} loading={submitting} className="flex-1" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
