import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase/config';

const NATURE_BG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleMagicKey = async () => {
    if (!email) return Alert.alert('Missing email', 'Please enter your neighborhood email.');
    setLoading(true);
    try {
      const actionCodeSettings = {
        url: 'https://barterly-64865398-4cda8.firebaseapp.com/login/verify',
        handleCodeInApp: true,
        iOS: { bundleId: 'com.barterly.app' },
        android: { packageName: 'com.barterly.app', installApp: true, minimumVersion: '12' },
        dynamicLinkDomain: undefined,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      setSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: NATURE_BG }}
      style={styles.bg}
      blurRadius={Platform.OS === 'ios' ? 8 : 4}
    >
      {/* DARK OVERLAY */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

            {/* BACK BUTTON */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Landing')}>
              <Text style={styles.backText}>← Back to Village Gate</Text>
            </TouchableOpacity>

            {/* SPACER */}
            <View style={{ flex: 1, minHeight: 60 }} />

            {/* FROSTED CARD */}
            <View style={styles.card}>

              {/* KEY ICON */}
              <View style={styles.keyIcon}>
                <Text style={styles.keyEmoji}>🗝️</Text>
              </View>

              {/* TITLE */}
              <Text style={styles.title}>Welcome Home.</Text>
              <Text style={styles.subtitle}>Unlocking the neighborhood gate.</Text>

              {sent ? (
                <View style={styles.sentBox}>
                  <Text style={styles.sentEmoji}>📬</Text>
                  <Text style={styles.sentTitle}>Magic Key Sent!</Text>
                  <Text style={styles.sentSub}>
                    Check your inbox at {'\n'}<Text style={styles.sentEmail}>{email}</Text>
                    {'\n'}Click the link to enter the village.
                  </Text>
                </View>
              ) : (
                <>
                  {/* GOOGLE */}
                  <TouchableOpacity
                    style={styles.googleButton}
                    onPress={() => Alert.alert('Coming soon', 'Google sign-in coming in next update!')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.googleG}>G</Text>
                    <Text style={styles.googleText}>Sign in with Google</Text>
                  </TouchableOpacity>

                  {/* DIVIDER */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* EMAIL MAGIC KEY */}
                  <Text style={styles.label}>MAGIC KEY VIA EMAIL</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>✉</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="neighbor@example.com"
                      placeholderTextColor="rgba(255,255,255,0.35)"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.magicButton}
                    onPress={handleMagicKey}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.magicButtonText}>Send My Magic Key</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* JOIN LINK */}
              <TouchableOpacity style={styles.joinBtn} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.joinText}>
                  New here? <Text style={styles.joinAccent}>Join the Neighborhood →</Text>
                </Text>
              </TouchableOpacity>

            </View>

            <Text style={styles.footer}>SOVEREIGN OS V1.0 · ACCESS NODE</Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 30, 10, 0.55)',
  },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  backBtn: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  backText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '500',
  },

  card: {
    backgroundColor: 'rgba(20, 40, 20, 0.82)',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(126, 232, 50, 0.15)',
    marginTop: 'auto',
    overflow: 'hidden',
  },

  keyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#4A8C3F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  keyEmoji: { fontSize: 36 },

  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '300',
  },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5A8A3C',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 4,
  },
  googleG: { fontSize: 20, fontWeight: '900', color: '#0F1A0F' },
  googleText: { fontSize: 16, fontWeight: '700', color: '#0F1A0F' },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  dividerText: {
    marginHorizontal: 14,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    letterSpacing: 2,
  },

  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5A8A3C',
    letterSpacing: 2,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: { fontSize: 16, marginRight: 10, opacity: 0.6 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#FFFFFF',
  },

  magicButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  magicButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  sentBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sentEmoji: { fontSize: 48, marginBottom: 16 },
  sentTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5A8A3C',
    marginBottom: 12,
  },
  sentSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  sentEmail: {
    color: '#5A8A3C',
    fontWeight: '700',
  },

  joinBtn: { alignItems: 'center', marginTop: 24 },
  joinText: { fontSize: 14, color: 'rgba(255,255,255,0.45)' },
  joinAccent: { color: '#5A8A3C', fontWeight: '700' },

  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1.5,
    marginTop: 20,
  },
});