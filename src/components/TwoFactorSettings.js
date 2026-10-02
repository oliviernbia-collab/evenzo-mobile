import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image } from 'react-native';
import Button from './Button';
import Input from './Input';
import Banner from './Banner';
import Badge from './Badge';
import { get2FAStatus, setup2FA, verify2FASetup, disable2FA } from '../api/twofa';

/** Activation/désactivation de la double authentification (TOTP) — partagé client/pro. */
export default function TwoFactorSettings() {
  const [enabled, setEnabled] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState(null); // { qrCode, secret }
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { const data = await get2FAStatus(); setEnabled(data.enabled); } catch { /* silencieux */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStartSetup = async () => {
    setError('');
    setBusy(true);
    try {
      const data = await setup2FA();
      setSetupData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Entrez le code à 6 chiffres affiché dans votre application.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await verify2FASetup(code);
      setSetupData(null);
      setCode('');
      setSuccess('Double authentification activée.');
      setEnabled(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Entrez votre code 2FA actuel pour confirmer la désactivation.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await disable2FA(code);
      setCode('');
      setSuccess('Double authentification désactivée.');
      setEnabled(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  return (
    <View className="mb-8">
      <View className="mb-3 flex-row items-center gap-2">
        <Text className="text-lg font-bold text-gray-900">Double authentification</Text>
        <Badge label={enabled ? 'Activée' : 'Désactivée'} tone={enabled ? 'green' : 'gray'} />
      </View>

      <Banner message={error} tone="error" />
      <Banner message={success} tone="success" />

      {!enabled && !setupData ? (
        <>
          <Text className="mb-3 text-sm text-gray-500">
            Ajoutez une couche de sécurité supplémentaire : un code à 6 chiffres généré par une app comme Google Authenticator sera demandé à chaque connexion.
          </Text>
          <Button title="Activer la double authentification" variant="secondary" onPress={handleStartSetup} loading={busy} />
        </>
      ) : null}

      {setupData ? (
        <View className="rounded-xl border border-gray-100 bg-white p-4">
          <Text className="mb-3 text-sm text-gray-600">
            Scannez ce QR code avec Google Authenticator, Authy ou Microsoft Authenticator, puis entrez le code généré.
          </Text>
          <Image source={{ uri: setupData.qrCode }} className="mb-3 h-48 w-48 self-center" resizeMode="contain" />
          <Text className="mb-3 text-center text-xs text-gray-400">Ou saisissez manuellement : {setupData.secret}</Text>
          <Input label="Code à 6 chiffres" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="123456" />
          <Button title="Confirmer l'activation" onPress={handleVerify} loading={busy} />
        </View>
      ) : null}

      {enabled ? (
        <View className="rounded-xl border border-gray-100 bg-white p-4">
          <Text className="mb-3 text-sm text-gray-500">
            Pour désactiver, confirmez avec un code actuel de votre application d'authentification.
          </Text>
          <Input label="Code à 6 chiffres" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="123456" />
          <Button title="Désactiver la double authentification" variant="danger" onPress={handleDisable} loading={busy} />
        </View>
      ) : null}
    </View>
  );
}
