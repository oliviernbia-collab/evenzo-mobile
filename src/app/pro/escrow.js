import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Banner from '../../components/Banner';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { ArrowLeft, ShieldCheck, Upload, X } from '../../components/icons';
import {
  getMyEscrowTransactions, cancelEscrowAsProvider, reportClientNoShow, respondToDispute,
} from '../../api/escrow';
import { uploadDisputeEvidence } from '../../api/upload';
import { formatFcfa, formatDate } from '../../utils/format';
import { extensionForMime } from '../../utils/mime';
import { MODAL_BACKDROP } from '../../constants/styles';

const STATUS_LABEL = { held: 'Bloqué', released: 'Libéré', disputed: 'En litige', refunded: 'Remboursé', resolved_other: 'Résolu' };
const STATUS_TONE = { held: 'amber', released: 'green', disputed: 'red', refunded: 'blue', resolved_other: 'gray' };

export default function ProviderEscrowScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [respondTarget, setRespondTarget] = useState(null);
  const [response, setResponse] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const load = useCallback(async () => {
    try { const data = await getMyEscrowTransactions(); setTransactions(data.transactions || []); } catch { setTransactions([]); }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleCancel = async (tx) => {
    setBusyId(tx.id);
    try { await cancelEscrowAsProvider(tx.id); await load(); } catch (err) { setError(err.message); } finally { setBusyId(null); }
  };

  const handleNoShow = async (tx) => {
    setBusyId(tx.id);
    try { await reportClientNoShow(tx.id); await load(); } catch (err) { setError(err.message); } finally { setBusyId(null); }
  };

  const openRespond = (tx) => {
    setRespondTarget(tx);
    setResponse('');
    setEvidenceUrls([]);
  };

  const pickEvidence = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 5, quality: 0.8 });
    if (result.canceled) return;
    setUploadingEvidence(true);
    setError('');
    try {
      const uploaded = [];
      for (const asset of result.assets) {
        const mimeType = asset.mimeType || 'image/jpeg';
        const up = await uploadDisputeEvidence({ uri: asset.uri, name: `evidence.${extensionForMime(mimeType)}`, mimeType });
        uploaded.push(up.url);
      }
      setEvidenceUrls((prev) => [...prev, ...uploaded].slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingEvidence(false);
    }
  };

  const submitResponse = async () => {
    if (response.trim().length < 20) {
      setError('Votre réponse doit faire au moins 20 caractères.');
      return;
    }
    setBusyId(respondTarget.id);
    try {
      await respondToDispute(respondTarget.id, { response, evidence_urls: evidenceUrls });
      setRespondTarget(null);
      setResponse('');
      setEvidenceUrls([]);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <LoadingView />;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <Text className="mb-4 text-xl font-bold text-gray-900">Paiements sécurisés</Text>

      <Banner message={error} tone="error" />

      {transactions.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={40} color="#9ca3af" />} title="Aucune transaction sécurisée" />
      ) : transactions.map((tx) => (
        <View key={tx.id} className="mb-3 rounded-xl border border-gray-100 bg-white p-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-semibold text-gray-900">{tx.client_name || tx.service_name}</Text>
            <Badge label={STATUS_LABEL[tx.status] || tx.status} tone={STATUS_TONE[tx.status] || 'gray'} />
          </View>
          <Text className="font-bold text-amber-700">{formatFcfa(tx.net_to_provider_fcfa)} <Text className="text-xs text-gray-400">net</Text></Text>
          <Text className="mt-1 text-xs text-gray-400">Initié le {formatDate(tx.created_at)}</Text>

          {tx.status === 'held' ? (
            <View className="mt-3 flex-row gap-2">
              <Button title="Client absent" variant="secondary" onPress={() => handleNoShow(tx)} loading={busyId === tx.id} className="flex-1 py-2" />
              <Button title="Annuler" variant="secondary" onPress={() => handleCancel(tx)} loading={busyId === tx.id} className="flex-1 py-2" />
            </View>
          ) : null}
          {tx.status === 'disputed' && !tx.provider_response ? (
            <Button title="Répondre au litige" onPress={() => openRespond(tx)} className="mt-3 py-2" />
          ) : null}
        </View>
      ))}

      <Modal visible={!!respondTarget} animationType="slide" transparent onRequestClose={() => setRespondTarget(null)}>
        <View className="flex-1 justify-end" style={MODAL_BACKDROP}>
          <View className="rounded-t-2xl bg-white p-5">
            <Text className="mb-3 text-lg font-bold text-gray-900">Répondre au litige</Text>
            <Input label="Votre réponse (20 caractères min.)" value={response} onChangeText={setResponse} multiline numberOfLines={5} />

            <Text className="mb-2 text-sm font-medium text-gray-700">Preuves (optionnel, 5 max)</Text>
            <View className="mb-3 flex-row flex-wrap gap-2">
              {evidenceUrls.map((url) => (
                <View key={url} className="relative">
                  <Image source={{ uri: url }} className="h-16 w-16 rounded-lg" />
                  <Pressable
                    onPress={() => setEvidenceUrls((prev) => prev.filter((u) => u !== url))}
                    className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full bg-gray-800"
                  >
                    <X size={10} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {evidenceUrls.length < 5 ? (
                <Pressable onPress={pickEvidence} disabled={uploadingEvidence} className="h-16 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300">
                  <Upload size={18} color="#6b7280" />
                </Pressable>
              ) : null}
            </View>

            <View className="flex-row gap-2">
              <Button title="Annuler" variant="secondary" onPress={() => setRespondTarget(null)} className="flex-1" />
              <Button title="Envoyer" onPress={submitResponse} loading={busyId === respondTarget?.id} className="flex-1" />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
