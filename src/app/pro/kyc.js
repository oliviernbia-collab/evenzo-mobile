import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Badge from '../../components/Badge';
import LoadingView from '../../components/LoadingView';
import { ArrowLeft, Upload, ShieldCheck } from '../../components/icons';
import { getKycStatus, submitKycDocuments, uploadKycDocument, KYC_DOCUMENT_TYPES } from '../../api/kyc';
import { extensionForMime } from '../../utils/mime';

const STATUS_TONE = { unverified: 'gray', incomplete: 'amber', pending: 'blue', approved: 'green', rejected: 'red', suspended: 'red' };

export default function ProviderKycScreen() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState('CNI');
  const [frontUrl, setFrontUrl] = useState('');
  const [backUrl, setBackUrl] = useState('');
  const [rccmUrl, setRccmUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [references, setReferences] = useState('');
  const [uploadingSide, setUploadingSide] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try { setStatus(await getKycStatus()); } catch { /* silencieux */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pickAndUpload = async (side, setUrl) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (result.canceled) return;
    setUploadingSide(side);
    setError('');
    try {
      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      const up = await uploadKycDocument({ uri: asset.uri, name: `${side}.${extensionForMime(mimeType)}`, mimeType }, side);
      setUrl(up.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingSide(null);
    }
  };

  const handleSubmit = async () => {
    if (!frontUrl) {
      setError('Le recto de votre document est obligatoire.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitKycDocuments({
        document_type: docType,
        document_front_url: frontUrl,
        document_back_url: backUrl || undefined,
        rccm_url: rccmUrl || undefined,
        business_name: businessName || undefined,
        mobile_money_number: mobileMoneyNumber || undefined,
        professional_references: references || undefined,
      });
      setSuccess('Documents soumis ! Votre dossier sera examiné sous 24-48h.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingView />;

  const canSubmit = !status || ['unverified', 'incomplete', 'rejected'].includes(status.status);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 flex-row items-center gap-2">
        <ArrowLeft size={18} /><Text className="text-sm text-gray-600">Retour</Text>
      </Pressable>
      <Text className="mb-4 text-xl font-bold text-gray-900">Vérification KYC</Text>

      {status ? (
        <View className="mb-5 flex-row items-center gap-2">
          <Badge label={status.status} tone={STATUS_TONE[status.status] || 'gray'} />
          <Text className="flex-1 text-xs text-gray-500">{status.message}</Text>
        </View>
      ) : null}

      <Banner message={error} tone="error" />
      <Banner message={success} tone="success" />

      {canSubmit ? (
        <>
          <Text className="mb-2 text-sm font-medium text-gray-700">Type de document</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {KYC_DOCUMENT_TYPES.map((t) => (
              <Pressable key={t.value} onPress={() => setDocType(t.value)} className={`rounded-full border px-3 py-1.5 ${docType === t.value ? 'border-amber-600 bg-amber-50' : 'border-gray-200'}`}>
                <Text className="text-xs text-gray-700">{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {[{ side: 'front', label: 'Recto du document', url: frontUrl, set: setFrontUrl },
            { side: 'back', label: 'Verso (optionnel)', url: backUrl, set: setBackUrl },
            { side: 'rccm', label: 'Registre de commerce (si entreprise déclarée)', url: rccmUrl, set: setRccmUrl }].map((d) => (
            <View key={d.side} className="mb-3">
              <Text className="mb-1.5 text-sm font-medium text-gray-700">{d.label}</Text>
              <Pressable
                onPress={() => pickAndUpload(d.side, d.set)}
                className={`flex-row items-center justify-center gap-2 rounded-xl border py-3 ${d.url ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
              >
                <Upload size={16} color={d.url ? '#16a34a' : '#4b5563'} />
                <Text className={`text-sm font-medium ${d.url ? 'text-green-700' : 'text-gray-600'}`}>
                  {uploadingSide === d.side ? 'Envoi...' : d.url ? 'Document ajouté' : 'Choisir une photo'}
                </Text>
              </Pressable>
              {d.url ? <Image source={{ uri: d.url }} className="mt-2 h-32 w-full rounded-lg" resizeMode="cover" /> : null}
            </View>
          ))}

          <Input label="Nom de l'entreprise (optionnel)" value={businessName} onChangeText={setBusinessName} />
          <Input label="Numéro Mobile Money (optionnel)" value={mobileMoneyNumber} onChangeText={setMobileMoneyNumber} keyboardType="phone-pad" />
          <Input label="Références professionnelles (optionnel)" value={references} onChangeText={setReferences} multiline numberOfLines={3} />

          <Button title="Soumettre mon dossier" onPress={handleSubmit} loading={submitting} className="mb-8" />
        </>
      ) : (
        <View className="items-center py-10">
          <ShieldCheck size={40} color="#16a34a" />
          <Text className="mt-3 text-center text-sm text-gray-600">{status?.message}</Text>
        </View>
      )}
    </Screen>
  );
}
