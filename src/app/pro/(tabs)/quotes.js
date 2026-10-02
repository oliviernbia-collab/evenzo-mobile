import { useState, useEffect, useCallback } from 'react';
import { View, Text, Modal } from 'react-native';
import Screen from '../../../components/Screen';
import TopBar from '../../../components/TopBar';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import EmptyState from '../../../components/EmptyState';
import LoadingView from '../../../components/LoadingView';
import { FileText } from '../../../components/icons';
import { getMyQuotes, respondToQuote, updateQuoteStatus } from '../../../api/quotes';
import { formatFcfa, formatDate } from '../../../utils/format';
import { MODAL_BACKDROP } from '../../../constants/styles';

const STATUS_TONE = { pending: 'gray', quoted: 'blue', accepted: 'green', rejected: 'red', modification_requested: 'amber' };
const STATUS_LABEL = { pending: 'Nouvelle demande', quoted: 'Devis envoyé', accepted: 'Accepté par le client', rejected: 'Refusé', modification_requested: 'Modification demandée' };

export default function ProviderQuotesScreen() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [respondTarget, setRespondTarget] = useState(null);
  const [price, setPrice] = useState('');
  const [conditions, setConditions] = useState('');
  const [validityDays, setValidityDays] = useState('7');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try { setQuotes(await getMyQuotes()); } catch { setQuotes([]); }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const decline = async (q) => { await updateQuoteStatus(q.id, 'rejected'); load(); };

  const submitResponse = async () => {
    setSending(true);
    try {
      await respondToQuote(respondTarget.id, { price, conditions, validity_days: validityDays });
      setRespondTarget(null);
      setPrice(''); setConditions(''); setValidityDays('7');
      load();
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingView />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <TopBar title="Devis reçus" />

      {quotes.length === 0 ? (
        <EmptyState icon={<FileText size={40} color="#9ca3af" />} title="Aucune demande de devis" />
      ) : quotes.map((q) => (
        <View key={q.id} className="mb-3 rounded-xl border border-gray-100 bg-white p-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-semibold text-gray-900">{q.client_name}</Text>
            <Badge label={STATUS_LABEL[q.status] || q.status} tone={STATUS_TONE[q.status] || 'gray'} />
          </View>
          <Text className="text-sm text-gray-600">{q.service_name}</Text>
          {q.event_date ? <Text className="text-xs text-gray-400">Pour le {q.event_date}</Text> : null}
          {q.details ? <Text className="mt-1 text-xs text-gray-500">{q.details}</Text> : null}

          {['pending', 'modification_requested'].includes(q.status) ? (
            <View className="mt-3 flex-row gap-2">
              <Button title="Décliner" variant="secondary" onPress={() => decline(q)} className="flex-1 py-2" />
              <Button title="Envoyer un devis" onPress={() => setRespondTarget(q)} className="flex-1 py-2" />
            </View>
          ) : null}

          {q.status === 'quoted' ? (
            <Text className="mt-2 text-sm font-semibold text-amber-700">Devis envoyé : {formatFcfa(q.quoted_price)}</Text>
          ) : null}

          <Text className="mt-2 text-xs text-gray-400">Reçu le {formatDate(q.created_at)}</Text>
        </View>
      ))}

      <Modal visible={!!respondTarget} animationType="slide" transparent onRequestClose={() => setRespondTarget(null)}>
        <View className="flex-1 justify-end" style={MODAL_BACKDROP}>
          <View className="rounded-t-2xl bg-white p-5">
            <Text className="mb-3 text-lg font-bold text-gray-900">Répondre au devis</Text>
            <Input label="Prix proposé (FCFA)" value={price} onChangeText={setPrice} keyboardType="number-pad" />
            <Input label="Conditions (optionnel)" value={conditions} onChangeText={setConditions} multiline numberOfLines={3} />
            <Input label="Validité (jours)" value={validityDays} onChangeText={setValidityDays} keyboardType="number-pad" />
            <View className="flex-row gap-2">
              <Button title="Annuler" variant="secondary" onPress={() => setRespondTarget(null)} className="flex-1" />
              <Button title="Envoyer" onPress={submitResponse} loading={sending} className="flex-1" />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
