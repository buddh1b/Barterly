import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';

const SKILLS: Record<string, string[]> = {
  'EDUCATION & WELLNESS': ['ACADEMIC TUTORING', 'LANGUAGE LESSONS', 'YOGA / FITNESS', 'MUSIC LESSONS', 'WRITING / EDITING', 'TRANSLATION'],
  'HANDS-ON': ['MOVING HELP', 'CLEANING', 'GARDENING', 'HANDYMAN', 'CAR REPAIR', 'PAINTING', 'FURNITURE ASSEMBLY', 'CAR WASH / DETAILING'],
  'PROFESSIONAL': ['ELECTRICIAN', 'PLUMBING', 'CHEF / MEAL PREP', 'BAKING', 'ACCOUNTING', 'GRAPHIC DESIGN', 'TECH SUPPORT', 'PHOTOGRAPHY', 'BARBER / HAIRCUT', 'TAILORING / REPAIRS'],
  'SIMPLE FAVORS': ['DELIVERY / COURIER', 'DOG WALKING', 'PET SITTING', 'MAIL COLLECTION', 'GROCERY RUNS', 'TRASH TAKEOUT', 'HOUSE SITTING', 'BABYSITTING'],
  'TOOLS & GEAR': ['I HAVE A TRUCK', 'I HAVE A LADDER', 'I HAVE A POWER DRILL', 'I HAVE A PRESSURE WASHER', 'I HAVE A LAWN MOWER'],
};

const STEPS = [
  { icon: '🔑', label: 'Access' },
  { icon: '👤', label: 'Identity' },
  { icon: '🔨', label: 'Craft' },
  { icon: '🤝', label: 'Needs' },
];

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExistsModal, setShowExistsModal] = useState(false);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [zip, setZip] = useState('');
  const [offeredSkills, setOfferedSkills] = useState<string[]>([]);
  const [desiredSkills, setDesiredSkills] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const toggleSkill = (skill: string, type: 'offer' | 'desire') => {
    if (type === 'offer') {
      setOfferedSkills(prev =>
        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      );
    } else {
      setDesiredSkills(prev =>
        prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
      );
    }
  };

  const checkEmailAndProceed = async () => {
    if (!email) return Alert.alert('Missing Email', 'Please enter your neighborhood email.');
    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        setShowExistsModal(true);
      } else {
        setStep(1);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const autoPassword = Math.random().toString(36).slice(-10) + 'Aa1!';
      const cred = await createUserWithEmailAndPassword(auth, email, autoPassword);
      await setDoc(doc(db, 'users', cred.user.uid), {
        id: cred.user.uid,
        firstName, lastName, displayName,
        email, phone,
        streetAddress: street,
        unitNumber: unit,
        zipCode: zip,
        city: '', state: '',
        formattedAddress: `${street}, ${unit}, ${zip}`,
        offeredSkillTagIds: offeredSkills,
        desiredSkillTagIds: desiredSkills,
        skillDescription: description,
        karmaBalance: 5,
        tradesRemaining: 3,
        agreedToCodeTimestamp: new Date().toISOString(),
        codeVersion: '1.0',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* EMAIL EXISTS MODAL */}
      <Modal visible={showExistsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>🏠</Text>
            <Text style={styles.modalTitle}>Already a Neighbor!</Text>
            <Text style={styles.modalDesc}>
              This email is already registered in the village.{'\n'}
              Head to the login gate instead.
            </Text>
            <TouchableOpacity
              style={styles.modalLoginBtn}
              onPress={() => {
                setShowExistsModal(false);
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.modalLoginBtnText}>GO TO LOGIN →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowExistsModal(false)}
            >
              <Text style={styles.modalCancelText}>Use Different Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PROGRESS BAR */}
      <View style={styles.progressBar}>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.stepWrapper}>
            <View style={[styles.stepCircle, i <= step && styles.stepCircleActive]}>
              <Text style={styles.stepIcon}>{s.icon}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* STEP 0 — VILLAGE ENTRANCE */}
        {step === 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>VILLAGE ENTRANCE</Text>
            <Text style={styles.cardSub}>ESTABLISH YOUR SOVEREIGN ACCOUNT</Text>

            <Text style={styles.label}>NEIGHBORHOOD EMAIL</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                placeholder="neighbor@example.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={checkEmailAndProceed}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>INITIATE VERIFICATION</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR ENTER WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => Alert.alert('Coming soon', 'Google sign-in coming in next update!')}
            >
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleText}>Google Identity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Landing')}
            >
              <Text style={styles.backText}>← Back to Village Gate</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 1 — CLAIM YOUR ADDRESS */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>CLAIM YOUR ADDRESS</Text>
            <Text style={styles.cardSub}>NEIGHBORHOOD IDENTITY DETAILS</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>FIRST NAME</Text>
                <TextInput
                  style={styles.inputSolo}
                  placeholder="First"
                  placeholderTextColor="#666"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>LAST NAME</Text>
                <TextInput
                  style={styles.inputSolo}
                  placeholder="Last"
                  placeholderTextColor="#666"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <Text style={styles.label}>NEIGHBORHOOD CALL-SIGN (DISPLAY NAME)</Text>
            <TextInput
              style={styles.inputSolo}
              placeholder="How neighbors know you"
              placeholderTextColor="#666"
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput
              style={styles.inputSolo}
              placeholder="(555) 000-0000"
              placeholderTextColor="#666"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.sectionLabel}>📍 PORCH LOCATION</Text>

            <Text style={styles.label}>STREET NAME & NUMBER</Text>
            <TextInput
              style={styles.inputSolo}
              placeholder="123 Main St"
              placeholderTextColor="#666"
              value={street}
              onChangeText={setStreet}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>UNIT / APT</Text>
                <TextInput
                  style={styles.inputSolo}
                  placeholder="Unit 4"
                  placeholderTextColor="#666"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>ZIP CODE</Text>
                <TextInput
                  style={styles.inputSolo}
                  placeholder="78660"
                  placeholderTextColor="#666"
                  value={zip}
                  onChangeText={setZip}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                if (!firstName || !lastName || !displayName || !zip) {
                  return Alert.alert('Missing fields', 'Please fill in all required fields.');
                }
                setStep(2);
              }}
            >
              <Text style={styles.primaryButtonText}>CONTINUE JOURNEY</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => setStep(0)}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2 — STATE YOUR CRAFT */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>STATE YOUR CRAFT</Text>
            <Text style={styles.cardSub}>HOW DO YOU SHOW UP FOR YOUR NEIGHBORS?</Text>

            {Object.entries(SKILLS).map(([category, skills]) => (
              <View key={category} style={styles.skillSection}>
                <Text style={styles.skillCategory}>{category}</Text>
                <View style={styles.skillGrid}>
                  {skills.map(skill => (
                    <TouchableOpacity
                      key={skill}
                      style={[styles.skillChip, offeredSkills.includes(skill) && styles.skillChipActive]}
                      onPress={() => toggleSkill(skill, 'offer')}
                    >
                      <Text style={[styles.skillChipText, offeredSkills.includes(skill) && styles.skillChipTextActive]}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(3)}>
              <Text style={styles.primaryButtonText}>CONTINUE JOURNEY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3 — WHAT DO YOU NEED */}
        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>WHAT HELP DO YOU NEED?</Text>
            <Text style={styles.cardSub}>YOUR NEIGHBORHOOD WISHLIST</Text>

            {Object.entries(SKILLS).map(([category, skills]) => (
              <View key={category} style={styles.skillSection}>
                <Text style={styles.skillCategory}>{category}</Text>
                <View style={styles.skillGrid}>
                  {skills.map(skill => (
                    <TouchableOpacity
                      key={skill}
                      style={[styles.skillChip, desiredSkills.includes(skill) && styles.skillChipDesired]}
                      onPress={() => toggleSkill(skill, 'desire')}
                    >
                      <Text style={[styles.skillChipText, desiredSkills.includes(skill) && styles.skillChipTextDesired]}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <Text style={styles.label}>NEIGHBORHOOD DESCRIPTION</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Tell your neighbors about yourself..."
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleFinish}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>PREPARE HANDSHAKE 🤝</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.footer}>SOVEREIGN OS V1.0 · REGISTRATION NODE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#161616' },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#222',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
  },
  modalIcon: { fontSize: 40, marginBottom: 16 },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalDesc: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalLoginBtn: {
    backgroundColor: '#6AAF45',
    borderRadius: 10,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalLoginBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  modalCancelBtn: { padding: 10 },
  modalCancelText: { color: '#666', fontSize: 14 },

  // PROGRESS
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  stepWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: '#6AAF45', borderColor: '#6AAF45' },
  stepIcon: { fontSize: 18 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#333' },
  stepLineActive: { backgroundColor: '#6AAF45' },

  // CARD
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#6AAF45',
    fontStyle: 'italic',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardSub: {
    fontSize: 10,
    color: '#555',
    letterSpacing: 1.5,
    marginBottom: 24,
    fontWeight: '600',
  },

  // INPUTS
  row: { flexDirection: 'row', marginBottom: 4 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputIcon: { fontSize: 16, marginRight: 10, opacity: 0.5 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#fff' },
  inputSolo: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6AAF45',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  textarea: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // BUTTONS
  primaryButton: {
    backgroundColor: '#6AAF45',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  dividerText: {
    marginHorizontal: 12,
    color: '#555',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 10,
  },
  googleG: { fontSize: 18, fontWeight: '900', color: '#4285F4' },
  googleText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  backButton: { alignItems: 'center', marginTop: 16 },
  backText: { fontSize: 13, color: '#555' },

  // SKILLS
  skillSection: { marginBottom: 20 },
  skillCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  skillChipActive: { backgroundColor: '#6AAF45', borderColor: '#6AAF45' },
  skillChipDesired: { backgroundColor: '#7A6200', borderColor: '#F5C842' },
  skillChipText: { fontSize: 11, fontWeight: '700', color: '#666', letterSpacing: 0.5 },
  skillChipTextActive: { color: '#fff' },
  skillChipTextDesired: { color: '#F5C842' },

  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: '#333',
    letterSpacing: 1.5,
    marginTop: 8,
  },
});