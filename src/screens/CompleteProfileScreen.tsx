import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CompleteProfileScreen() {
  const navigation = useNavigation<any>();
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid || '';
  const email = currentUser?.email || '';
  const googleName = currentUser?.displayName || '';

  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(
    googleName?.split(' ')[0] || ''
  );
  const [lastName, setLastName] = useState(
    googleName?.split(' ')[1] || ''
  );
  const [displayName, setDisplayName] = useState(googleName || '');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [zip, setZip] = useState('');

  const handleSave = async () => {
    if (!firstName || !lastName || !zip) {
      return Alert.alert(
        'Missing fields',
        'First name, last name, and zip code are required.'
      );
    }
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', uid), {
        id: uid,
        firstName,
        lastName,
        displayName: displayName || `${firstName} ${lastName}`,
        email,
        phone,
        streetAddress: street,
        unitNumber: unit,
        zipCode: zip,
        city: '',
        state: '',
        formattedAddress: `${street}, ${unit}, ${zip}`,
        offeredSkillTagIds: [],
        desiredSkillTagIds: [],
        skillDescription: '',
        // Trust starts at 0 — built from real reviews
        trustScore: 0,
        totalTrades: 0,
        agreedToCodeTimestamp: new Date().toISOString(),
        codeVersion: '1.0',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // App.tsx detects profile exists → navigates to Home
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#7C3AED', '#FF2D78']}
              style={styles.headerIcon}
            >
              <Text style={{ fontSize: 32 }}>✨</Text>
            </LinearGradient>
            <Text style={styles.title}>Almost there!</Text>
            <Text style={styles.subtitle}>
              Complete your profile to start trading on Barterly.
            </Text>
          </View>

          {/* TRUST INFO BOX */}
          <View style={styles.trustInfoBox}>
            <Text style={styles.trustInfoIcon}>🏅</Text>
            <View style={styles.trustInfoContent}>
              <Text style={styles.trustInfoTitle}>
                Your Trust Score starts at 0
              </Text>
              <Text style={styles.trustInfoDesc}>
                Build your reputation by completing trades and
                collecting honest reviews from other traders.
              </Text>
            </View>
          </View>

          {/* IDENTITY CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Identity</Text>
            <Text style={styles.cardSub}>
              How other traders will find and know you.
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>FIRST NAME *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>LAST NAME *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Last"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <Text style={styles.label}>DISPLAY NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional — defaults to your full name"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="(555) 000-0000 (optional)"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* LOCATION CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📍 Your Location</Text>
            <Text style={styles.cardSub}>
              Used to match you with nearby traders. Never shared publicly.
            </Text>

            <Text style={styles.label}>STREET ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main St (optional)"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={street}
              onChangeText={setStreet}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>UNIT / APT</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Unit 4"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>ZIP CODE *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="78660"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={zip}
                  onChangeText={setZip}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* WHAT TO EXPECT */}
          <View style={styles.expectCard}>
            <Text style={styles.expectTitle}>What happens next</Text>
            {[
              {
                icon: '📦',
                text: 'Post your first listing — goods, services, or skills',
              },
              {
                icon: '🔍',
                text: 'Browse listings from traders near you',
              },
              {
                icon: '🤝',
                text: 'Complete your first trade and get reviewed',
              },
              {
                icon: '🏅',
                text: 'Watch your Trust Score grow with each trade',
              },
            ].map((item, i) => (
              <View key={i} style={styles.expectRow}>
                <Text style={styles.expectIcon}>{item.icon}</Text>
                <Text style={styles.expectText}>{item.text}</Text>
              </View>
            ))}
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#7C3AED', '#FF2D78']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  Start Trading →
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Fields marked * are required.{'\n'}
            You can update your profile anytime.
          </Text>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  orb: { position: 'absolute', borderRadius: 9999 },
  orb1: {
    width: 280, height: 280,
    backgroundColor: '#7C3AED', opacity: 0.12,
    top: -80, right: -80,
  },
  orb2: {
    width: 200, height: 200,
    backgroundColor: '#FF2D78', opacity: 0.08,
    bottom: 100, left: -60,
  },

  // HEADER
  header: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  headerIcon: {
    width: 80, height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30, fontWeight: '900',
    color: '#fff', letterSpacing: -0.8,
    marginBottom: 8, textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center', lineHeight: 21,
    maxWidth: 280, fontWeight: '300',
  },

  // TRUST INFO
  trustInfoBox: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  trustInfoIcon: { fontSize: 24 },
  trustInfoContent: { flex: 1 },
  trustInfoTitle: {
    fontSize: 14, fontWeight: '800',
    color: '#A78BFA', marginBottom: 4,
  },
  trustInfoDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 19,
  },

  // CARDS
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18, fontWeight: '900',
    color: '#fff', marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 20, lineHeight: 19,
  },

  // INPUTS
  row: { flexDirection: 'row', marginBottom: 4 },
  label: {
    fontSize: 10, fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5, marginBottom: 8, marginTop: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, color: '#fff', marginBottom: 4,
  },

  // EXPECT CARD
  expectCard: {
    backgroundColor: 'rgba(0,255,178,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,178,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  expectTitle: {
    fontSize: 13, fontWeight: '800',
    color: '#00FFB2', marginBottom: 14,
    letterSpacing: 0.3,
  },
  expectRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  expectIcon: { fontSize: 18 },
  expectText: {
    flex: 1, fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 19,
  },

  // SUBMIT
  submitBtn: {
    borderRadius: 14, overflow: 'hidden',
    marginBottom: 16,
  },
  submitBtnGradient: {
    padding: 18, alignItems: 'center',
    borderRadius: 14, minHeight: 56,
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff', fontSize: 16,
    fontWeight: '800', letterSpacing: 0.3,
  },

  footer: {
    textAlign: 'center', fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 0.3, lineHeight: 18,
  },
});