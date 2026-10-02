import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Badge from '../../components/Badge';
import LoadingView from '../../components/LoadingView';
import { ArrowLeft, Upload, CheckCircle } from '../../components/icons';
import { getMySubscriptionStatus } from '../../api/providers';
import {
  getSubscriptionPlans, submitManualPayment, getMyManualPaymentSubmissions, WAVE_PAYMENT_NUMBER,
} from '../../api/subscriptions';
import { uploadPaymentScreenshot } from '../../api/upload';
import { formatFcfa, formatDate } from '../../utils/format';
import { extensionForMime } from '../../utils/mime';

const SUBMISSION_LABEL = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté' };
const SUBMISSION_TONE = { pending: 'amber', approved: 'green', rejected: 'red' };

export default function ProviderSubscriptionScreen() {
  const [status, setStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, p, subs] = await Promise.all([getMySubscriptionStatus(), getSubscriptionPlans(), getMyManualPaymentSubmissions()]);
      setStatus(s);
      setPlans(p);
      setSubmissions(subs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyNumber = () => Clipboard.setStringAsync(WAVE_PAYMENT_NUMBER);

  const pickScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    setUploading(true);
    try {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      const up = await uploadPaymentScreenshot({ uri: asset.uri, name: `screenshot.${extensionForMime(mimeType)}`, mimeType });
      setScreenshotUrl(up.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlan || !screenshotUrl) {
      setError('Sélectionnez une formule et joignez votre capture de paiement.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitManualPayment({
        plan_id: selectedPlan.id,
        billing_cycle: '1_month',
        amount_fcfa: selectedPlan.price_xof,
        screenshot_url: screenshotUrl,
      });
      setSuccess('Preuve de paiement envoyée. Validation sous 24h.');
      setSelectedPlan(null);
      setScreenshotUrl('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingView />;

  const hasPendingSubmission = submissions.some((s) => s.status === 'pending');

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <Text className="mb-4 text-xl font-bold text-gray-900">Abonnement</Text>

      {status ? (
        <Banner
          message={status.mode === 'trial'
            ? `Essai gratuit actif jusqu'au ${new Date(status.trialEndsAt).toLocaleDateString('fr-FR')}.`
            : status.mode === 'subscription'
              ? `Formule ${status.tier === 'pro' ? 'Pro' : 'Simple'} active jusqu'au ${new Date(status.periodEnd).toLocaleDateString('fr-FR')}.`
              : 'Votre essai gratuit est terminé. Choisissez une formule pour continuer.'}
          tone={status.active ? 'success' : 'error'}
        />
      ) : null}

      <Banner message={error} tone="error" />
      <Banner message={success} tone="success" />

      {hasPendingSubmission ? (
        <Banner message="Une soumission est déjà en attente de validation par notre équipe." tone="info" />
      ) : (
        <>
          <Text className="mb-2 mt-2 text-sm font-semibold text-gray-700">Choisir une formule</Text>
          {plans.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => setSelectedPlan(plan)}
              className={`mb-2 rounded-xl border p-4 ${selectedPlan?.id === plan.id ? 'border-amber-600 bg-amber-50' : 'border-gray-200 bg-white'}`}
            >
              <Text className="font-semibold text-gray-900">{plan.name}</Text>
              <Text className="mt-1 text-sm text-amber-700">{formatFcfa(plan.price_xof)} / mois</Text>
            </Pressable>
          ))}

          {selectedPlan ? (
            <View className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
              <Text className="mb-2 text-sm font-semibold text-gray-700">Paiement Wave</Text>
              <Pressable onPress={copyNumber} className="mb-3 flex-row items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                <Text className="font-mono text-sm text-amber-800">{WAVE_PAYMENT_NUMBER}</Text>
                <Text className="text-xs font-semibold text-amber-700">Copier</Text>
              </Pressable>

              <Pressable
                onPress={pickScreenshot}
                className={`flex-row items-center justify-center gap-2 rounded-xl border py-3 ${screenshotUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
              >
                {screenshotUrl ? <CheckCircle size={16} color="#16a34a" /> : <Upload size={16} color="#4b5563" />}
                <Text className={`text-sm font-medium ${screenshotUrl ? 'text-green-700' : 'text-gray-600'}`}>
                  {uploading ? 'Envoi...' : screenshotUrl ? 'Capture ajoutée' : "Joindre la capture d'écran"}
                </Text>
              </Pressable>
              {screenshotUrl ? <Image source={{ uri: screenshotUrl }} className="mt-2 h-32 w-full rounded-lg" /> : null}

              <Button title="Envoyer la preuve de paiement" onPress={handleSubmit} loading={submitting} className="mt-4" />
            </View>
          ) : null}
        </>
      )}

      {submissions.length > 0 ? (
        <View className="mt-6">
          <Text className="mb-2 text-sm font-semibold text-gray-700">Historique</Text>
          {submissions.map((s) => (
            <View key={s.id} className="mb-2 flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
              <View>
                <Text className="text-sm font-medium text-gray-800">{s.plan_name}</Text>
                <Text className="text-xs text-gray-400">{formatDate(s.created_at)}</Text>
              </View>
              <Badge label={SUBMISSION_LABEL[s.status] || s.status} tone={SUBMISSION_TONE[s.status] || 'gray'} />
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
