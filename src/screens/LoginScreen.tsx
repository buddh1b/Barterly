import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import {
  sendSignInLinkToEmail,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');
const IOS_CLIENT_ID = '791045231240-df1lie133qlqv6vidr40ogh95k2g4hkd.apps.googleusercontent.com';
const WEB_CLIENT_ID = '791045231240-lr6uou7n4c5srll39m6ovngrdbtremrc.apps.googleusercontent.com';

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
};

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'not_found' | 'found'>('idle');

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    redirectUri: 'com.barterly.app:/oauth2redirect/google',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response);
    }
  }, [response]);

  const handleGoogleResponse = async (response: any) => {
    setGoogleLoading(true);
    try {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      await signInWithCredential(auth, credential);
    } catch (error: any) {
      Alert.alert('Google Sign-in Error', error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleMagicKey = async () => {
    if (!email) return Alert.alert('Missing email', 'Please enter your email.');
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        setEmailStatus('not_found');
        setLoading(false);
        return;
      }
      setEmailStatus('found');
      await sendSignInLinkToEmail(auth, email, {
        url: 'https://barterly-64865398-4cda8.firebaseapp.com/login/verify',
        handleCodeInApp: true,
        iOS: { bundleId: 'com.barterly.app' },
        android: { packageName: 'com.barterly.app', installApp: true, minimumVersion: '12' },
      });
      setSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0A0015', '#0D0A2E', '#0A1628']}
      style={styles.container}
    >
      {/* ORBS */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* BACK */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('Landing')}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {/* HEADER */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#7C3AED', '#FF2D78']}
                style={styles.keyIcon}
              >
                <Text style={{ fontSize: 32 }}>🗝️</Text>
              </LinearGradient>
              <Text style={styles.title}>Welcome back.</Text>
              <Text style={styles.subtitle}>
                Enter your neighborhood gate.
              </Text>
            </View>

            {/* CARD */}
            <View style={styles.card}>
              {sent ? (
                // SENT STATE
                <View style={styles.sentBox}>
                  <Text style={{ fontSize: 52, marginBottom: 16 }}>📬</Text>
                  <Text style={styles.sentTitle}>Magic Key Sent!</Text>
                  <Text style={styles.sentSub}>
                    Check your inbox at{'\n'}
                    <Text style={styles.sentEmail}>{email}</Text>
                    {'\n\n'}Click the link to enter.
                  </Text>
                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={() => {
                      setSent(false);
                      setEmailStatus('idle');
                      setEmail('');
                    }}
                  >
                    <Text style={styles.resetText}>Use different email</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* GOOGLE */}
                  <TouchableOpacity
                    style={styles.googleBtn}
                    onPress={() => promptAsync()}
                    disabled={!request || googleLoading}
                    activeOpacity={0.85}
                  >
                    {googleLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.googleG}>G</Text>
                        <Text style={styles.googleText}>
                          Continue with Google
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* DIVIDER */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* EMAIL */}
                  <Text style={styles.label}>MAGIC KEY VIA EMAIL</Text>
                  <View style={[
                    styles.inputWrapper,
                    emailStatus === 'not_found' && styles.inputError,
                  ]}>
                    <Text style={styles.inputIcon}>✉</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        setEmailStatus('idle');
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  {/* NO PORCH FOUND */}
                  {emailStatus === 'not_found' && (
                    <View style={styles.noPorchBox}>
                      <Text style={styles.noPorchIcon}>🏚️</Text>
                      <Text style={styles.noPorchTitle}>
                        No account found
                      </Text>
                      <Text style={styles.noPorchDesc}>
                        This email isn't registered yet.
                      </Text>
                      <TouchableOpacity
                        style={styles.joinBtn}
                        onPress={() => navigation.navigate('Register')}
                      >
                        <LinearGradient
                          colors={['#7C3AED', '#FF2D78']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.joinBtnGradient}
                        >
                          <Text style={styles.joinBtnText}>
                            Join the Village →
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* SEND BUTTON */}
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={handleMagicKey}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.sendBtnText}>
                        Send My Magic Key
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* REGISTER LINK */}
              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerLinkText}>
                  New here?{' '}
                  <Text style={styles.registerLinkAccent}>
                    Create an account →
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>
              SOVEREIGN OS V1.0 · ACCESS NODE
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  orb: { position: 'absolute', borderRadius: 9999 },
  orb1: {
    width: 280,
    height: 280,
    backgroundColor: '#7C3AED',
    opacity: 0.12,
    top: -80,
    right: -80,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: '#FF2D78',
    opacity: 0.08,
    bottom: 100,
    left: -60,
  },

  backBtn: { paddingTop: 16, paddingBottom: 8 },
  backText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '500',
  },

  header: { alignItems: 'center', paddingVertical: 32 },
  keyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '300',
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },

  // GOOGLE
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 16,
    minHeight: 52,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // DIVIDER
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    letterSpacing: 2,
  },

  // EMAIL INPUT
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
    letterSpacing: 2,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  inputError: { borderColor: '#FF2D78' },
  inputIcon: { fontSize: 16, marginRight: 10, opacity: 0.5 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#fff',
  },

  // NO PORCH
  noPorchBox: {
    backgroundColor: 'rgba(255,45,120,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,45,120,0.2)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  noPorchIcon: { fontSize: 32, marginBottom: 8 },
  noPorchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF2D78',
    marginBottom: 6,
  },
  noPorchDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 16,
  },
  joinBtn: { borderRadius: 10, overflow: 'hidden', width: '100%' },
  joinBtnGradient: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  joinBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // SEND BUTTON
  sendBtn: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    minHeight: 52,
  },
  sendBtnText: {
    color: '#A78BFA',
    fontSize: 15,
    fontWeight: '700',
  },

  // SENT STATE
  sentBox: { alignItems: 'center', paddingVertical: 16 },
  sentTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#7C3AED',
    marginBottom: 12,
  },
  sentSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
  },
  sentEmail: { color: '#A78BFA', fontWeight: '700' },
  resetBtn: { marginTop: 20 },
  resetText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },

  // REGISTER LINK
  registerLink: { alignItems: 'center', marginTop: 20 },
  registerLinkText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
  },
  registerLinkAccent: { color: '#7C3AED', fontWeight: '700' },

  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 1.5,
  },
});