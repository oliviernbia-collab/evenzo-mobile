import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Input from './Input';
import Button from './Button';
import Banner from './Banner';

const POLICIES = [
  { value: 'flexible', label: 'Flexible', hint: '100% remboursé si annulé +7j avant' },
  { value: 'moderate', label: 'Modérée', hint: '100% remboursé si annulé +14j avant' },
  { value: 'strict', label: 'Stricte', hint: '50% remboursé si annulé +30j avant' },
];

export default function ServiceForm({ initial, onSubmit, submitLabel = 'Enregistrer' }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : '');
  const [cancellationPolicy, setCancellationPolicy] = useState(initial?.cancellation_policy || 'moderate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !price) {
      setError('Le nom et le prix sont obligatoires.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), description, price, cancellation_policy: cancellationPolicy });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Banner message={error} tone="error" />
      <Input label="Nom du service" value={name} onChangeText={setName} placeholder="Ex: Prestation DJ soirée mariage" />
      <Input label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholder="Décrivez ce que comprend ce service..." />
      <Input label="Prix (FCFA)" value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="150000" />

      <Text className="mb-2 text-sm font-medium text-gray-700">Politique d'annulation</Text>
      <View className="mb-5 gap-2">
        {POLICIES.map((p) => (
          <Pressable
            key={p.value}
            onPress={() => setCancellationPolicy(p.value)}
            className={`rounded-xl border px-4 py-3 ${cancellationPolicy === p.value ? 'border-amber-600 bg-amber-50' : 'border-gray-200 bg-white'}`}
          >
            <Text className={`font-medium ${cancellationPolicy === p.value ? 'text-amber-800' : 'text-gray-700'}`}>{p.label}</Text>
            <Text className="text-xs text-gray-500">{p.hint}</Text>
          </Pressable>
        ))}
      </View>

      <Button title={submitLabel} onPress={handleSubmit} loading={loading} />
    </View>
  );
}
