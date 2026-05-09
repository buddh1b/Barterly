import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { label: 'Education & Wellness', icon: '📚' },
  { label: 'Hands-On', icon: '🔨' },
  { label: 'Professional', icon: '💼' },
  { label: 'Simple Favors', icon: '🤝' },
  { label: 'Tools & Gear', icon: '🛠️' },
  { label: 'Technology', icon: '💻' },
  { label: 'Design & Creative', icon: '🎨' },
  { label: 'Food & Cooking', icon: '🍳' },
  { label: 'Outdoor & Garden', icon: '🌿' },
  { label: 'Automotive', icon: '🚗' },
];

const EXCHANGE_TYPES = [
  {
    id: 'TRADE',
    label: 'Pure Trade',
    desc: 'Goods for goods, no cash',
    icon: '🔄',
    colors: ['#7C3AED', '#A855F7'] as [string, string],
  },
  {
    id: 'CASH',
    label: 'Cash Only',
    desc: 'Straightforward cash deal',
    icon: '💵',
    colors: ['#059669', '#10B981'] as [string, string],
  },
  {
    id: 'HYBRID',
    label: 'Trade + Cash',
    desc: 'Mix of goods and cash',
    icon: '⚖️',
    colors: ['#D97706', '#F59E0B'] as [string, string],
  },
  {
    id: 'SERVICE',
    label: 'Service Swap',
    desc: 'Skills for goods or skills',
    icon: '🛠️',
    colors: ['#FF2D78', '#FF6B9D'] as [string, string],
  },
];

export default function PostBountyScreen() {
  const navigation = useNavigation<any>();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'REQUEST' | 'OFFER'>('OFFER');
  const [classification, setClassification] =
    useState<'ITEM' | 'SERVICE'>('ITEM');
  const [exchangeType, setExchangeType] = useState('TRADE');
  const [wantedItem, setWantedItem] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [zip, setZip] = useState('');

  const handlePost = async () => {
    if (!title || !description || !category || !zip) {
      return Alert.alert(
        'Missing fields',
        'Please fill in title, description, category and zip code.'
      );
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'bounties'), {
        creatorId: user?.uid,
        creatorDisplayName: user?.displayName || 'Anonymous',
        creatorKarma: 5,
        title,
        description,
        category,
        type,
        classification,
        exchangeType,
        wantedItem,
        cashAmount: cashAmount ? parseFloat(cashAmount) : 0,
        status: 'OPEN',
        zipCode: zip,
        imageUrl: null,
        timestamp: serverTimestamp(),
      });
      Alert.alert(
        '🎉 Bounty Posted!',
        'Your listing is now live in the village.',
        [{ text: 'View Feed', onPress: () => navigation.goBack() }]
      );
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

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post a Bounty</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* TYPE TOGGLE — OFFER or REQUEST */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>WHAT ARE YOU DOING?</Text>
            <Text style={styles.cardSub}>
              OFFERING SOMETHING OR LOOKING FOR SOMETHING?
            </Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  type === 'OFFER' && styles.toggleBtnActive,
                ]}
                onPress={() => setType('OFFER')}
              >
                {type === 'OFFER' ? (
                  <LinearGradient
                    colors={['#7C3AED', '#A855F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.toggleGradient}
                  >
                    <Text style={styles.toggleTextActive}>
                      📦 I'm Offering
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.toggleText}>📦 I'm Offering</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  type === 'REQUEST' && styles.toggleBtnActive,
                ]}
                onPress={() => setType('REQUEST')}
              >
                {type === 'REQUEST' ? (
                  <LinearGradient
                    colors={['#FF2D78', '#FF6B9D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.toggleGradient}
                  >
                    <Text style={styles.toggleTextActive}>
                      🔍 I'm Requesting
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.toggleText}>🔍 I'm Requesting</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* ITEM or SERVICE */}
            <Text style={[styles.label, { marginTop: 16 }]}>
              CLASSIFICATION
            </Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  classification === 'ITEM' && styles.toggleBtnActive,
                ]}
                onPress={() => setClassification('ITEM')}
              >
                {classification === 'ITEM' ? (
                  <LinearGradient
                    colors={['#00D4FF', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.toggleGradient}
                  >
                    <Text style={styles.toggleTextActive}>📦 Item/Good</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.toggleText}>📦 Item/Good</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  classification === 'SERVICE' && styles.toggleBtnActive,
                ]}
                onPress={() => setClassification('SERVICE')}
              >
                {classification === 'SERVICE' ? (
                  <LinearGradient
                    colors={['#00FFB2', '#10B981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.toggleGradient}
                  >
                    <Text style={styles.toggleTextActive}>
                      🛠️ Service/Skill
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.toggleText}>🛠️ Service/Skill</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* DETAILS CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>LISTING DETAILS</Text>
            <Text style={styles.cardSub}>TELL NEIGHBORS WHAT YOU HAVE</Text>

            <Text style={styles.label}>TITLE *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Vintage Fender Guitar 1998"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={title}
              onChangeText={setTitle}
              maxLength={80}
            />
            <Text style={styles.charCount}>{title.length}/80</Text>

            <Text style={styles.label}>DESCRIPTION *</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Describe condition, details, what's included..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>

            <Text style={styles.label}>ZIP CODE *</Text>
            <TextInput
              style={styles.input}
              placeholder="78660"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={zip}
              onChangeText={setZip}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          {/* CATEGORY CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>CATEGORY *</Text>
            <Text style={styles.cardSub}>
              WHAT TYPE OF LISTING IS THIS?
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.label}
                  style={[
                    styles.categoryChip,
                    category === cat.label && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat.label)}
                >
                  {category === cat.label ? (
                    <LinearGradient
                      colors={['#7C3AED', '#FF2D78']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.categoryChipGradient}
                    >
                      <Text style={styles.categoryChipIconActive}>
                        {cat.icon}
                      </Text>
                      <Text style={styles.categoryChipTextActive}>
                        {cat.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.categoryChipInner}>
                      <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                      <Text style={styles.categoryChipText}>{cat.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* EXCHANGE TYPE CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>EXCHANGE TYPE</Text>
            <Text style={styles.cardSub}>HOW DO YOU WANT TO TRADE?</Text>
            <View style={styles.exchangeGrid}>
              {EXCHANGE_TYPES.map((et) => (
                <TouchableOpacity
                  key={et.id}
                  style={[
                    styles.exchangeCard,
                    exchangeType === et.id && styles.exchangeCardActive,
                  ]}
                  onPress={() => setExchangeType(et.id)}
                >
                  {exchangeType === et.id && (
                    <LinearGradient
                      colors={et.colors}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}
                  <Text style={styles.exchangeIcon}>{et.icon}</Text>
                  <Text style={[
                    styles.exchangeLabel,
                    exchangeType === et.id && styles.exchangeLabelActive,
                  ]}>
                    {et.label}
                  </Text>
                  <Text style={[
                    styles.exchangeDesc,
                    exchangeType === et.id && styles.exchangeDescActive,
                  ]}>
                    {et.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* WHAT DO YOU WANT CARD */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>WHAT DO YOU WANT?</Text>
            <Text style={styles.cardSub}>
              TELL NEIGHBORS WHAT YOU'RE LOOKING FOR IN RETURN
            </Text>

            <Text style={styles.label}>LOOKING FOR</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Road bike, camera gear, accounting help..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={wantedItem}
              onChangeText={setWantedItem}
            />

            {(exchangeType === 'CASH' || exchangeType === 'HYBRID') && (
              <>
                <Text style={styles.label}>CASH AMOUNT ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={cashAmount}
                  onChangeText={setCashAmount}
                  keyboardType="decimal-pad"
                />
              </>
            )}
          </View>

          {/* POST BUTTON */}
          <TouchableOpacity
            style={styles.postBtn}
            onPress={handlePost}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#7C3AED', '#FF2D78']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.postBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.postBtnText}>
                  🚀 POST TO THE VILLAGE
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Your listing will be visible to all neighbors immediately.
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
    opacity: 0.1,
    top: -80,
    right: -80,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: '#FF2D78',
    opacity: 0.06,
    bottom: 200,
    left: -60,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { width: 60 },
  backText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },

  // CARD
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
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
    marginBottom: 16,
  },

  // TOGGLE
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleBtnActive: {
    borderColor: 'transparent',
  },
  toggleGradient: {
    padding: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleText: {
    padding: 14,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // INPUTS
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 12,
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
    minHeight: 110,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 4,
    letterSpacing: 0.5,
  },

  // CATEGORIES
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipActive: {
    borderColor: 'transparent',
  },
  categoryChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  categoryChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChipIcon: { fontSize: 14 },
  categoryChipIconActive: { fontSize: 14 },
  categoryChipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },

  // EXCHANGE TYPES
  exchangeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  exchangeCard: {
    width: (width - 80) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  exchangeCardActive: {
    borderColor: 'transparent',
  },
  exchangeIcon: { fontSize: 24, marginBottom: 8 },
  exchangeLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  exchangeLabelActive: { color: '#fff' },
  exchangeDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    lineHeight: 16,
  },
  exchangeDescActive: { color: 'rgba(255,255,255,0.7)' },

  // POST BUTTON
  postBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 12,
  },
  postBtnGradient: {
    padding: 18,
    alignItems: 'center',
    borderRadius: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  postBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
  },
});