import { useState, useRef } from 'react';
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
import { searchNeighborhoods } from '../services/placesService';

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
  { icon: '📧', label: 'Account' },
  { icon: '👤', label: 'Details' },
  { icon: '🛠️', label: 'Offer' },
  { icon: '🤝', label: 'Needs' },
];

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const searchTimeout = useRef<any>(null);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExistsModal, setShowExistsModal] = useState(false);

  // Step 0
  const [email, setEmail] = useState('');

  // Step 1 — personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [zip, setZip] = useState('');

  // Step 1 — neighborhood
  const [neighborhoodQuery, setNeighborhoodQuery] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [selectedNeighborhoodData, setSelectedNeighborhoodData] =
    useState<any>(null);
  const [neighborhoodSearching, setNeighborhoodSearching] = useState(false);

  // Step 2 & 3
  const [offeredSkills, setOfferedSkills] = useState<string[]>([]);
  const [desiredSkills, setDesiredSkills] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  // ── NEIGHBORHOOD SEARCH ──────────────────────────────────
  const searchForNeighborhoods = (zipCode: string, query: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setNeighborhoodSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchNeighborhoods(zipCode, query);
        setNeighborhoods(results);
      } catch (error) {
        console.log('Neighborhood search error:', error);
        setNeighborhoods([]);
      } finally {
        setNeighborhoodSearching(false);
      }
    }, 600);
  };

  // ── SKILL TOGGLE ─────────────────────────────────────────
  const toggleSkill = (skill: string, type: 'offer' | 'desire') => {
    if (type === 'offer') {
      setOfferedSkills(prev =>
        prev.includes(skill)
          ? prev.filter(s => s !== skill)
          : [...prev, skill]
      );
    } else {
      setDesiredSkills(prev =>
        prev.includes(skill)
          ? prev.filter(s => s !== skill)
          : [...prev, skill]
      );
    }
  };

  // ── CHECK EMAIL ──────────────────────────────────────────
  const checkEmailAndProceed = async () => {
    if (!email) {
      return Alert.alert('Missing Email', 'Please enter your email.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert('Invalid Email', 'Please enter a valid email.');
    }
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

  // ── FINISH REGISTRATION ──────────────────────────────────
  const handleFinish = async () => {
    setLoading(true);
    try {
      const autoPassword = Math.random().toString(36).slice(-10) + 'Aa1!';
      const cred = await createUserWithEmailAndPassword(
        auth, email, autoPassword
      );
      await setDoc(doc(db, 'users', cred.user.uid), {
        id: cred.user.uid,
        firstName,
        lastName,
        displayName: displayName || `${firstName} ${lastName}`,
        email, phone,
        streetAddress: street,
        unitNumber: unit,
        zipCode: zip,
        city: '', state: '',
        formattedAddress: `${street}, ${unit}, ${zip}`,
        // Neighborhood data
        neighborhoodId: selectedNeighborhood === 'individual'
          ? null : selectedNeighborhood || null,
        neighborhoodName: selectedNeighborhood === 'individual'
          ? 'Individual'
          : selectedNeighborhoodData?.name || null,
        neighborhoodAddress: selectedNeighborhoodData?.address || null,
        isIndividual: selectedNeighborhood === 'individual' ||
          !selectedNeighborhood,
        offeredSkillTagIds: offeredSkills,
        desiredSkillTagIds: desiredSkills,
        skillDescription: description,
        trustScore: 0,
        totalTrades: 0,
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
            <Text style={{ fontSize: 40, marginBottom: 16 }}>👋</Text>
            <Text style={styles.modalTitle}>Account Already Exists</Text>
            <Text style={styles.modalDesc}>
              An account with this email already exists.{'\n'}
              Sign in instead to continue trading.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowExistsModal(false);
                navigation.navigate('Login');
              }}
            >
              <LinearGradient
                colors={['#7C3AED', '#FF2D78']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalBtn}
              >
                <Text style={styles.modalBtnText}>Go to Sign In →</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
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
                    style={styles.stepGradient}
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

          {/* ══ STEP 0 — CREATE ACCOUNT ══ */}
          {step === 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Create Account</Text>
              <Text style={styles.cardSub}>
                Free forever. No credit card required.
              </Text>

              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoFocus
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
                    <Text style={styles.primaryBtnText}>Continue →</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.hint}>
                We'll send you a sign-in link. No password needed.
              </Text>

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => navigation.navigate('Landing')}
              >
                <Text style={styles.backLinkText}>← Back to home</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ STEP 1 — YOUR DETAILS ══ */}
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Details</Text>
              <Text style={styles.cardSub}>
                How other traders will find and know you.
              </Text>

              {/* NAME */}
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>FIRST NAME *</Text>
                  <TextInput
                    style={styles.inputSolo}
                    placeholder="First"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>LAST NAME *</Text>
                  <TextInput
                    style={styles.inputSolo}
                    placeholder="Last"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <Text style={styles.label}>DISPLAY NAME</Text>
              <TextInput
                style={styles.inputSolo}
                placeholder="How traders know you (optional)"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={displayName}
                onChangeText={setDisplayName}
              />

              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.inputSolo}
                placeholder="(555) 000-0000 (optional)"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              {/* LOCATION SECTION */}
              <Text style={styles.sectionDivider}>📍 Your Location</Text>
              <Text style={styles.locationHint}>
                Used to match you with nearby traders and communities.
              </Text>

              {/* ZIP CODE */}
              <Text style={styles.label}>ZIP CODE *</Text>
              <TextInput
                style={styles.inputSolo}
                placeholder="78660"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={zip}
                onChangeText={(text) => {
                  setZip(text);
                  // Auto-search neighborhoods when zip is complete
                  if (text.length === 5) {
                    searchForNeighborhoods(text, neighborhoodQuery);
                  }
                }}
                keyboardType="numeric"
                maxLength={5}
              />

              {/* NEIGHBORHOOD SEARCH */}
              <Text style={styles.label}>YOUR COMMUNITY</Text>
              <Text style={styles.locationHint}>
                Select your apartment, housing community, university,
                or dorm. Choose "Individual" if not applicable.
              </Text>

              <View style={styles.searchRow}>
                <TextInput
                  style={[styles.inputSolo, { flex: 1 }]}
                  placeholder={
                    zip.length < 5
                      ? 'Enter zip code first...'
                      : 'Search your community...'
                  }
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={neighborhoodQuery}
                  onChangeText={(text) => {
                    setNeighborhoodQuery(text);
                    if (zip.length === 5) {
                      searchForNeighborhoods(zip, text);
                    }
                  }}
                  editable={zip.length === 5 &&
                    selectedNeighborhood !== 'individual'}
                />
                {neighborhoodSearching && (
                  <ActivityIndicator
                    size="small"
                    color="#7C3AED"
                    style={styles.searchSpinner}
                  />
                )}
              </View>

              {/* INDIVIDUAL OPTION — always shown */}
              <TouchableOpacity
                style={[
                  styles.neighborhoodOption,
                  selectedNeighborhood === 'individual' &&
                    styles.neighborhoodOptionActive,
                ]}
                onPress={() => {
                  setSelectedNeighborhood('individual');
                  setSelectedNeighborhoodData(null);
                  setNeighborhoodQuery('Individual / Not part of a community');
                  setNeighborhoods([]);
                }}
              >
                <Text style={styles.neighborhoodOptionIcon}>🏠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.neighborhoodOptionName,
                    selectedNeighborhood === 'individual' &&
                      styles.neighborhoodOptionNameActive,
                  ]}>
                    Individual / Not Sure
                  </Text>
                  <Text style={styles.neighborhoodOptionAddr}>
                    Browse and trade with everyone in your area
                  </Text>
                </View>
                {selectedNeighborhood === 'individual' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              {/* SEARCH RESULTS */}
              {neighborhoods.length > 0 &&
                selectedNeighborhood !== 'individual' && (
                <View style={styles.neighborhoodList}>
                  <Text style={styles.resultsLabel}>
                    {neighborhoods.length} communities found nearby
                  </Text>
                  {neighborhoods.map((n) => (
                    <TouchableOpacity
                      key={n.placeId}
                      style={[
                        styles.neighborhoodOption,
                        selectedNeighborhood === n.placeId &&
                          styles.neighborhoodOptionActive,
                      ]}
                      onPress={() => {
                        setSelectedNeighborhood(n.placeId);
                        setSelectedNeighborhoodData(n);
                        setNeighborhoodQuery(n.name);
                        setNeighborhoods([]);
                      }}
                    >
                      <Text style={styles.neighborhoodOptionIcon}>🏘️</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.neighborhoodOptionName,
                          selectedNeighborhood === n.placeId &&
                            styles.neighborhoodOptionNameActive,
                        ]}>
                          {n.name}
                        </Text>
                        <Text
                          style={styles.neighborhoodOptionAddr}
                          numberOfLines={1}
                        >
                          {n.address}
                        </Text>
                      </View>
                      {selectedNeighborhood === n.placeId && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* SELECTED — show clear button */}
              {selectedNeighborhood &&
                selectedNeighborhood !== 'individual' && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => {
                    setSelectedNeighborhood('');
                    setSelectedNeighborhoodData(null);
                    setNeighborhoodQuery('');
                    setNeighborhoods([]);
                  }}
                >
                  <Text style={styles.clearBtnText}>
                    ✕ Clear community selection
                  </Text>
                </TouchableOpacity>
              )}

              {/* NO RESULTS */}
              {zip.length === 5 &&
                !neighborhoodSearching &&
                neighborhoods.length === 0 &&
                neighborhoodQuery.length > 2 &&
                !selectedNeighborhood && (
                <View style={styles.noResultsBox}>
                  <Text style={styles.noResultsText}>
                    No communities found for "{neighborhoodQuery}".{'\n'}
                    Try a different name or select Individual.
                  </Text>
                </View>
              )}

              {/* STREET ADDRESS */}
              <Text style={[styles.label, { marginTop: 16 }]}>
                STREET ADDRESS
              </Text>
              <TextInput
                style={styles.inputSolo}
                placeholder="123 Main St (optional)"
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
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  if (!firstName || !lastName || !zip) {
                    return Alert.alert(
                      'Missing fields',
                      'First name, last name, and zip code are required.'
                    );
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
                  <Text style={styles.primaryBtnText}>Continue →</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => setStep(0)}
              >
                <Text style={styles.backLinkText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ STEP 2 — WHAT YOU OFFER ══ */}
          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>What You Offer</Text>
              <Text style={styles.cardSub}>
                Select all the skills and services you can trade.
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
                          offeredSkills.includes(skill) &&
                            styles.skillChipOffer,
                        ]}
                        onPress={() => toggleSkill(skill, 'offer')}
                      >
                        <Text style={[
                          styles.skillChipText,
                          offeredSkills.includes(skill) &&
                            styles.skillChipTextOffer,
                        ]}>
                          {skill}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <Text style={styles.selectedCount}>
                {offeredSkills.length} selected
              </Text>

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
                  <Text style={styles.primaryBtnText}>Continue →</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => setStep(1)}
              >
                <Text style={styles.backLinkText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ STEP 3 — WHAT YOU NEED ══ */}
          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>What You Need</Text>
              <Text style={styles.cardSub}>
                What skills or goods are you looking for?
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
                          desiredSkills.includes(skill) &&
                            styles.skillChipWant,
                        ]}
                        onPress={() => toggleSkill(skill, 'desire')}
                      >
                        <Text style={[
                          styles.skillChipText,
                          desiredSkills.includes(skill) &&
                            styles.skillChipTextWant,
                        ]}>
                          {skill}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <Text style={styles.selectedCount}>
                {desiredSkills.length} selected
              </Text>

              <Text style={styles.label}>ABOUT YOU (OPTIONAL)</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Tell other traders a bit about yourself..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
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
                      Complete Setup 🎉
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => setStep(2)}
              >
                <Text style={styles.backLinkText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.footer}>
            By creating an account you agree to our Terms of Service
            and Privacy Policy.
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
    backgroundColor: '#00D4FF', opacity: 0.08,
    bottom: 200, left: -60,
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
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stepCircleActive: { borderColor: '#7C3AED' },
  stepGradient: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
  stepIcon: { fontSize: 18 },
  stepLine: {
    flex: 1, height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  stepLineActive: { backgroundColor: '#7C3AED' },

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
    fontSize: 26, fontWeight: '900',
    color: '#fff', letterSpacing: -0.5,
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 24, lineHeight: 20,
    fontWeight: '300',
  },

  // INPUTS
  row: { flexDirection: 'row', marginBottom: 4 },
  label: {
    fontSize: 10, fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5, marginBottom: 8, marginTop: 12,
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
  input: {
    flex: 1, paddingVertical: 14,
    fontSize: 15, color: '#fff',
  },
  inputSolo: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, color: '#fff', marginBottom: 4,
  },
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, color: '#fff',
    marginBottom: 16, minHeight: 90,
    textAlignVertical: 'top',
  },
  sectionDivider: {
    fontSize: 15, fontWeight: '800',
    color: '#A78BFA', marginTop: 20, marginBottom: 6,
  },
  locationHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 10, lineHeight: 18,
  },

  // NEIGHBORHOOD SEARCH
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchSpinner: { marginLeft: 8 },
  neighborhoodList: { gap: 8, marginBottom: 8, marginTop: 4 },
  resultsLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  neighborhoodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  neighborhoodOptionActive: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderColor: '#7C3AED',
  },
  neighborhoodOptionIcon: { fontSize: 20 },
  neighborhoodOptionName: {
    fontSize: 13, fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  neighborhoodOptionNameActive: { color: '#A78BFA' },
  neighborhoodOptionAddr: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    lineHeight: 15,
  },
  checkmark: {
    color: '#7C3AED', fontSize: 18, fontWeight: '900',
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: 8, marginBottom: 8,
  },
  clearBtnText: {
    color: '#FF2D78', fontSize: 12, fontWeight: '600',
  },
  noResultsBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10, padding: 12,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center', lineHeight: 18,
  },

  // BUTTONS
  primaryBtn: {
    borderRadius: 12, overflow: 'hidden', marginTop: 16,
  },
  primaryBtnGradient: {
    padding: 16, alignItems: 'center',
    borderRadius: 12, minHeight: 52,
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff', fontSize: 15,
    fontWeight: '800', letterSpacing: 0.3,
  },
  backLink: { alignItems: 'center', marginTop: 16 },
  backLinkText: {
    fontSize: 13, color: 'rgba(255,255,255,0.3)',
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center', marginTop: 10, lineHeight: 18,
  },

  // SKILLS
  skillSection: { marginBottom: 20 },
  skillCategory: {
    fontSize: 10, fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5, marginBottom: 10,
  },
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  skillChipOffer: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderColor: '#7C3AED',
  },
  skillChipWant: {
    backgroundColor: 'rgba(0,212,255,0.15)',
    borderColor: '#00D4FF',
  },
  skillChipText: {
    fontSize: 11, fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.3,
  },
  skillChipTextOffer: { color: '#A78BFA' },
  skillChipTextWant: { color: '#00D4FF' },
  selectedCount: {
    fontSize: 12, color: '#7C3AED',
    fontWeight: '700', marginBottom: 8,
    textAlign: 'right',
  },

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
    borderRadius: 24, padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  modalTitle: {
    fontSize: 20, fontWeight: '900',
    color: '#fff', marginBottom: 10,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center', lineHeight: 22,
    marginBottom: 24,
  },
  modalBtn: {
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 12, marginBottom: 12,
  },
  modalBtnText: {
    color: '#fff', fontWeight: '800',
    fontSize: 15, letterSpacing: 0.3,
  },
  modalCancel: { padding: 10 },
  modalCancelText: {
    color: 'rgba(255,255,255,0.3)', fontSize: 14,
  },

  footer: {
    textAlign: 'center', fontSize: 11,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 0.3, lineHeight: 18, marginTop: 8,
  },
});