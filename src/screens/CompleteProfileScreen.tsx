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
        'Please fill in your name and zip code at minimum.'
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
        karmaBalance: 5,
        tradesRemaining: 3,
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
              <Text style={{ fontSize: 32 }}>🏡</Text>
            </LinearGradient>
            <Text style={styles.title}>Claim Your Porch</Text>
            <Text style={styles.subtitle}>
              Complete your neighborhood profile to start trading.
            </Text>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>NEIGHBORHOOD IDENTITY</Text>
            <Text style={styles.cardSub}>
              HOW YOUR NEIGHBORS WILL KNOW YOU
            </Text>

            {/* NAME ROW */}
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

            <Text style={styles.label}>CALL-SIGN (DISPLAY NAME)</Text>
            <TextInput
              style={styles.input}
              placeholder="How neighbors know you"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="(555) 000-0000"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* LOCATION CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📍 PORCH LOCATION</Text>
            <Text style={styles.cardSub}>
              WHERE YOU ARE IN THE NEIGHBORHOOD
            </Text>

            <Text style={styles.label}>STREET NAME & NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main St"
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

          {/* INFO BOX */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Your address is only used to match you with nearby traders.
              It's never shared publicly.
            </Text>
          </View>

          {/* SUBMIT */}
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
                  ENTER THE VILLAGE 🏡
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Fields marked * are required
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 60,
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

  // HEADER
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
    fontWeight: '300',
  },

  // CARD
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#A78BFA',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 1.5,
    marginBottom: 20,
  },

  // INPUTS
  row: { flexDirection: 'row', marginBottom: 4 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    marginBottom: 4,
  },

  // INFO BOX
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  infoIcon: { fontSize: 16 },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 18,
  },

  // SUBMIT
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  submitBtnGradient: {
    padding: 18,
    alignItems: 'center',
    borderRadius: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 0.5,
  },
});