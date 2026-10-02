import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import Screen from '../../components/Screen';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Banner from '../../components/Banner';
import ReviewModal from '../../components/ReviewModal';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import { ArrowLeft, ShieldCheck, AlertTriangle, Star, Upload, X } from '../../components/icons';
import {
  getMyEscrowTransactions, initiateEscrow, confirmEscrow, cancelEscrowAsClient, disputeEscrow, DISPUTE_MOTIFS,
} from '../../api/escrow';
import { uploadDisputeEvidence } from '../../api/upload';
import { formatFcfa, formatDate } from '../../utils/format';
import { extensionForMime } from '../../utils/mime';
import { MODAL_BACKDROP } from '../../constants/styles';

const STATUS_LABEL = { held: 'Bloqué', released: 'Libéré', disputed: 'En litige', refunded: 'Remboursé', resolved_other: 'Résolu' };
const STATUS_TONE = { held: 'amber', released: 'green', disputed: 'red', refunded: 'blue', resolved_other: 'gray' };

export default function ClientEscrowScreen() {
  const params = useLocalSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [initiating, setInitiating] = useState(!!params.quoteId);
  const [amount, setAmount] = useState(params.amount ? String(params.amount) : '');
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [disputeMotif, setDisputeMotif] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  const load = useCallback(async () => {
    try { const data = await getMyEscrowTransactions(); setTransactions(data.transactions || []); } catch { setTransactions([]); }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleInitiate = async () => {
    setError('');
    setBusyId('init');
    try {
      await initiateEscrow({ quote_id: params.quoteId, provider_id: params.providerId, amount_fcfa: Number(amount) });
      setInitiating(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirm = async (tx) => {
    setBusyId(tx.id);
    try { await confirmEscrow(tx.id); await load(); } catch (err) { setError(err.message); } finally { setBusyId(null); }
  };

  const handleCancel = async (tx) => {
    setBusyId(tx.id);
    try { await cancelEscrowAsClient(tx.id); await load(); } catch (err) { setError(err.message); } finally { setBusyId(null); }
  };

  const openDispute = (tx) => {
    setDisputeTarget(tx);
    setDisputeMotif('');
    setDisputeReason('');
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

  const submitDispute = async () => {
    if (!disputeMotif || disputeReason.trim().length < 20) {
      setError('Sélectionnez un motif et décrivez le problème (20 caractères min).');
      return;
    }
    setBusyId(disputeTarget.id);
    try {
      await disputeEscrow(disputeTarget.id, { motif: disputeMotif, reason: disputeReason, evidence_urls: evidenceUrls });
      setDisputeTarget(null);
      setDisputeMotif('');
      setDisputeReason('');
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
      <Banner message={confirmation} tone="success" />

      {initiating ? (
        <View className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Text className="font-semibold text-amber-800">Nouvel acompte sécurisé — {params.providerName}</Text>
          <Text className="mt-1 text-xs text-amber-700">
            Vos fonds sont bloqués jusqu'à confirmation de la prestation. Un litige peut être ouvert en cas de problème.
          </Text>
          <Input label="Montant de l'acompte (FCFA)" value={amount} onChangeText={setAmount} keyboardType="number-pad" />
          <View className="flex-row gap-2">
            <Button title="Annuler" variant="secondary" onPress={() => setInitiating(false)} className="flex-1" />
            <Button title="Confirmer le paiement" onPress={handleInitiate} loading={busyId === 'init'} className="flex-1" />
          </View>
        </View>
      ) : null}

      {transactions.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={40} color="#9ca3af" />} title="Aucune transaction sécurisée" />
      ) : transactions.map((tx) => (
        <View key={tx.id} className="mb-3 rounded-xl border border-gray-100 bg-white p-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-semibold text-gray-900">{tx.provider_name || tx.service_name}</Text>
            <Badge label={STATUS_LABEL[tx.status] || tx.status} tone={STATUS_TONE[tx.status] || 'gray'} />
          </View>
          <Text className="font-bold text-amber-700">{formatFcfa(tx.amount_fcfa)}</Text>
          <Text className="mt-1 text-xs text-gray-400">Initié le {formatDate(tx.created_at)}</Text>

          {tx.status === 'held' ? (
            <View className="mt-3 flex-row gap-2">
              <Button title="Litige" variant="secondary" icon={<AlertTriangle size={14} color="#92400e" />} onPress={() => openDispute(tx)} className="flex-1 py-2" />
              <Button title="Annuler" variant="secondary" onPress={() => handleCancel(tx)} loading={busyId === tx.id} className="flex-1 py-2" />
              <Button title="Confirmer" onPress={() => handleConfirm(tx)} loading={busyId === tx.id} className="flex-1 py-2" />
            </View>
          ) : null}

          {tx.status === 'released' ? (
            <Button
              title="Laisser un avis"
              variant="secondary"
              icon={<Star size={14} color="#92400e" />}
              onPress={() => setReviewTarget(tx)}
              className="mt-3 py-2"
            />
          ) : null}
        </View>
      ))}

      <Modal visible={!!disputeTarget} animationType="slide" transparent onRequestClose={() => setDisputeTarget(null)}>
        <View className="flex-1 justify-end" style={MODAL_BACKDROP}>
          <View className="rounded-t-2xl bg-white p-5">
            <Text className="mb-3 text-lg font-bold text-gray-900">Ouvrir un litige</Text>
            <Text className="mb-2 text-sm font-medium text-gray-700">Motif</Text>
            <View className="mb-3 flex-row flex-wrap gap-2">
              {DISPUTE_MOTIFS.map((m) => (
                <Pressable key={m.value} onPress={() => setDisputeMotif(m.value)} className={`rounded-full border px-3 py-1.5 ${disputeMotif === m.value ? 'border-amber-600 bg-amber-50' : 'border-gray-200'}`}>
                  <Text className="text-xs text-gray-700">{m.label}</Text>
                </Pressable>
              ))}
            </View>
            <Input label="Décrivez le problème (20 caractères min.)" value={disputeReason} onChangeText={setDisputeReason} multiline numberOfLines={4} />

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
              <Button title="Annuler" variant="secondary" onPress={() => setDisputeTarget(null)} className="flex-1" />
              <Button title="Envoyer" onPress={submitDispute} loading={busyId === disputeTarget?.id} className="flex-1" />
            </View>
          </View>
        </View>
      </Modal>

      <ReviewModal
        visible={!!reviewTarget}
        providerId={reviewTarget?.provider_id}
        providerName={reviewTarget?.provider_name || reviewTarget?.service_name}
        onClose={() => setReviewTarget(null)}
        onSubmitted={() => {
          setReviewTarget(null);
          setConfirmation('Merci, votre avis a été publié.');
          setTimeout(() => setConfirmation(''), 3000);
        }}
      />
    </Screen>
  );
}
