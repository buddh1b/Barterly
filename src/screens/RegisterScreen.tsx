import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  Alert, Modal, Dimensions,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SKILLS: Record<string, string[]> = {
  'EDUCATION & WELLNESS': [
    'ACADEMIC TUTORING', 'LANGUAGE LESSONS', 'YOGA / FITNESS',
    'MUSIC LESSONS', 'WRITING / EDITING', 'TRANSLATION',
  ],
  'HANDS-ON': [
    'MOVING HELP', 'CLEANING', 'GARDENING', 'HANDYMAN',
    'CAR REPAIR', 'PAINTING', 'FURNITURE ASSEMBLY', 'CAR WASH',
  ],
  'PROFESSIONAL': [
    'ELECTRICIAN', 'PLUMBING', 'CHEF / MEAL PREP', 'BAKING',
    'ACCOUNTING', 'GRAPHIC DESIGN', 'TECH SUPPORT', 'PHOTOGRAPHY',
    'BARBER / HAIRCUT', 'TAILORING',
  ],
  'SIMPLE FAVORS': [
    'DELIVERY', 'DOG WALKING', 'PET SITTING', 'MAIL COLLECTION',
    'GROCERY RUNS', 'TRASH TAKEOUT', 'HOUSE SITTING', 'BABYSITTING',
  ],
  'TOOLS & GEAR': [
    'I HAVE A TRUCK', 'I HAVE A LADDER', 'I HAVE A POWER DRILL',
    'I HAVE A PRESSURE WASHER', 'I HAVE A LAWN MOWER',
  ],
};

const STEPS = [
  { icon: '🔑', label: 'Access' },
  { icon: '👤', label: 'Identity' },
  { icon: '🔨', label: 'Craft' },
  { icon: '🤝', label: 'Needs' },
];

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
};

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExistsModal, setShowExistsModal] = useState(false);

  // Step 0
  const [email, setEmail] = useState('');

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [zip, setZip] = useState('');

  // Step 2 & 3
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
    if (!email) return Alert.alert('Missing Email', 'Please enter your email.');
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

      {/* EMAIL EXISTS MODAL */}
      <Modal visible={showExistsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🏠</Text>
            <Text style={styles.modalTitle}>Already a Neighbor!</Text>
            <Text style={styles.modalDesc}>
              This email is already registered.{'\n'}
              Head to the login gate instead.
            </Text>
            <TouchableOpacity
              style={styles.modalLoginBtn}
              onPress={() => {
                setShowExistsModal(false);
                navigation.navigate('Login');
              }}
            >
              <LinearGradient
                colors={['#7C3AED', '#FF2D78']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalLoginGradient}
              >
                <Text style={styles.modalLoginText}>GO TO LOGIN →</Text>
              </LinearGradient>
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

      <SafeAreaView style={{ flex: 1 }}>
        {/* PROGRESS BAR */}
        <View style={styles.progressBar}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepWrapper}>
              <View style={[
                styles.stepCircle,
                i <= step && styles.stepCircleActive,
              ]}>
                {i <= step ? (
                  <LinearGradient
                    colors={['#7C3AED', '#FF2D78']}
                    style={styles.stepCircleGradient}
                  >
                    <Text style={styles.stepIcon}>{s.icon}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.stepIcon}>{s.icon}</Text>
                )}
              </View>
              {i < STEPS.length - 1 && (
                <View style={[
                  styles.stepLine,
                  i < step && styles.stepLineActive,
                ]} />
              )}
            </View>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ══ STEP 0 — VILLAGE ENTRANCE ══ */}
          {step === 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>VILLAGE ENTRANCE</Text>
              <Text style={styles.cardSub}>
                ESTABLISH YOUR SOVEREIGN ACCOUNT
              </Text>

              <Text style={styles.label}>NEIGHBORHOOD EMAIL</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉</Text>
                <TextInput
                  style={styles.input}
                  placeholder="neighbor@example.com"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={checkEmailAndProceed}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#7C3AED', '#FF2D78']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtnGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      INITIATE VERIFICATION
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.navigate('Landing')}
              >
                <Text style={styles.backText}>← Back to Village Gate</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ STEP 1 — CLAIM YOUR ADDRESS ══ */}
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>CLAIM YOUR ADDRESS</Text>
              <Text style={styles.cardSub}>
                NEIGHBORHOOD IDENTITY DETAILS
              </Text>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>FIRST NAME</Text>
                  <TextInput
                    style={styles.inputSolo}
                    placeholder="First"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>LAST NAME</Text>
                  <TextInput
                    style={styles.inputSolo}
                    placeholder="Last"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <Text style={styles.label}>CALL-SIGN (DISPLAY NAME)</Text>
              <TextInput
                style={styles.inputSolo}
                placeholder="How neighbors know you"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={displayName}
                onChangeText={setDisplayName}
              />

              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.inputSolo}
                placeholder="(555) 000-0000"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.sectionLabel}>📍 PORCH LOCATION</Text>

              <Text style={styles.label}>STREET NAME & NUMBER</Text>
              <TextInput
                style={styles.inputSolo}
                placeholder="123 Main St"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={street}
                onChangeText={setStreet}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>UNIT / APT</Text>
                  <TextInput
                    style={styles.inputSolo}
                    placeholder="Unit 4"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>ZIP CODE</Text>
                  <TextInput
                    style={styles.inputSolo}
                    placeholder="78660"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={zip}
                    onChangeText={setZip}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  if (!firstName || !lastName || !displayName || !zip) {
                    return Alert.alert('Missing fields', 'Please fill in all required fields.');
                  }
                  setStep(2);
                }}
              >
                <LinearGradient
                  colors={['#7C3AED', '#FF2D78']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtnGradient}
                >
                  <Text style={styles.primaryBtnText}>CONTINUE JOURNEY</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep(0)}
              >
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ STEP 2 — STATE YOUR CRAFT ══ */}
          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>STATE YOUR CRAFT</Text>
              <Text style={styles.cardSub}>
                HOW DO YOU SHOW UP FOR YOUR NEIGHBORS?
              </Text>

              {Object.entries(SKILLS).map(([category, skills]) => (
                <View key={category} style={styles.skillSection}>
                  <Text style={styles.skillCategory}>{category}</Text>
                  <View style={styles.skillGrid}>
                    {skills.map(skill => (
                      <TouchableOpacity
                        key={skill}
                        style={[
                          styles.skillChip,
                          offeredSkills.includes(skill) && styles.skillChipActive,
                        ]}
                        onPress={() => toggleSkill(skill, 'offer')}
                      >
                        <Text style={[
                          styles.skillChipText,
                          offeredSkills.includes(skill) && styles.skillChipTextActive,
                        ]}>
                          {skill}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setStep(3)}
              >
                <LinearGradient
                  colors={['#7C3AED', '#FF2D78']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtnGradient}
                >
                  <Text style={styles.primaryBtnText}>CONTINUE JOURNEY</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep(1)}
              >
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ STEP 3 — WHAT DO YOU NEED ══ */}
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
                        style={[
                          styles.skillChip,
                          desiredSkills.includes(skill) && styles.skillChipDesired,
                        ]}
                        onPress={() => toggleSkill(skill, 'desire')}
                      >
                        <Text style={[
                          styles.skillChipText,
                          desiredSkills.includes(skill) && styles.skillChipTextDesired,
                        ]}>
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
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleFinish}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#7C3AED', '#FF2D78']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtnGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      PREPARE HANDSHAKE 🤝
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep(2)}
              >
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.footer}>
            SOVEREIGN OS V1.0 · REGISTRATION NODE
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
    backgroundColor: '#00D4FF',
    opacity: 0.08,
    bottom: 200,
    left: -60,
  },

  // PROGRESS BAR
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stepCircleActive: {
    borderColor: '#7C3AED',
  },
  stepCircleGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: { fontSize: 18 },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  stepLineActive: {
    backgroundColor: '#7C3AED',
  },

  // CARD
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#A78BFA',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5,
    marginBottom: 24,
    fontWeight: '600',
  },

  // INPUTS
  row: { flexDirection: 'row', marginBottom: 4 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputIcon: { fontSize: 16, marginRight: 10, opacity: 0.4 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#fff' },
  inputSolo: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A78BFA',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // BUTTONS
  primaryBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  primaryBtnGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  backBtn: { alignItems: 'center', marginTop: 16 },
  backText: { fontSize: 13, color: 'rgba(255,255,255,0.3)' },

  // SKILLS
  skillSection: { marginBottom: 20 },
  skillCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  skillChipActive: {
    backgroundColor: 'rgba(124,58,237,0.3)',
    borderColor: '#7C3AED',
  },
  skillChipDesired: {
    backgroundColor: 'rgba(0,212,255,0.15)',
    borderColor: '#00D4FF',
  },
  skillChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.3,
  },
  skillChipTextActive: { color: '#A78BFA' },
  skillChipTextDesired: { color: '#00D4FF' },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#0D0A2E',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalLoginBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
  },
  modalLoginGradient: {
    padding: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  modalLoginText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  modalCancelBtn: { padding: 10 },
  modalCancelText: { color: 'rgba(255,255,255,0.3)', fontSize: 14 },

  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 1.5,
    marginTop: 8,
  },
});