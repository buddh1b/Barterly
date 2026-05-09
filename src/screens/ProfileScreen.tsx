import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProfile, getTrustLabel, getTrustColor } from '../types';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const user = auth.currentUser;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(auth),
        },
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0A0015', '#0D0A2E', '#0A1628']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </LinearGradient>
    );
  }

  const totalTrades = profile?.totalTrades || 0;
  const trustScore = profile?.trustScore || 0;
  const trustLabel = getTrustLabel(totalTrades);
  const trustColor = getTrustColor(totalTrades);
  const displayName = profile?.displayName ||
    user?.displayName ||
    `${profile?.firstName} ${profile?.lastName}` ||
    'Trader';

  // Progress to next level
  const getProgressToNext = (trades: number) => {
    if (trades === 0) return { current: 0, next: 1, label: 'First trade' };
    if (trades < 5) return { current: trades, next: 5, label: 'New Trader' };
    if (trades < 20) return { current: trades - 5, next: 15, label: 'Rising Trader' };
    if (trades < 50) return { current: trades - 20, next: 30, label: 'Trusted Trader' };
    return { current: 50, next: 50, label: 'Top Trader ✓' };
  };

  const progress = getProgressToNext(totalTrades);
  const progressPercent = Math.min(
    (progress.current / progress.next) * 100, 100
  );

  return (
    <LinearGradient
      colors={['#0A0015', '#0D0A2E', '#0A1628']}
      style={styles.container}
    >
      {/* ORBS */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      <SafeAreaView style={{ flex: 1 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutBtn}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >

          {/* PROFILE HERO */}
          <View style={styles.profileHero}>
            <LinearGradient
              colors={['#7C3AED', '#FF2D78']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {displayName[0]?.toUpperCase() || '?'}
              </Text>
            </LinearGradient>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>
              {profile?.email || user?.email}
            </Text>
            {profile?.zipCode && (
              <Text style={styles.location}>
                📍 {profile.zipCode}
              </Text>
            )}
          </View>

          {/* TRUST SCORE CARD */}
          <View style={styles.trustCard}>
            <View style={styles.trustHeader}>
              <View>
                <Text style={styles.trustCardLabel}>TRUST SCORE</Text>
                <Text style={[styles.trustScore, { color: trustColor }]}>
                  {totalTrades === 0 ? '—' : trustScore}
                </Text>
                <Text style={[styles.trustLevelLabel, { color: trustColor }]}>
                  {trustLabel}
                </Text>
              </View>
              <View style={styles.trustRingWrapper}>
                <LinearGradient
                  colors={
                    totalTrades === 0
                      ? ['#333', '#444']
                      : ['#7C3AED', '#00FFB2']
                  }
                  style={styles.trustRing}
                >
                  <View style={styles.trustRingInner}>
                    <Text style={styles.trustRingNumber}>
                      {totalTrades}
                    </Text>
                    <Text style={styles.trustRingLabel}>trades</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* PROGRESS BAR */}
            {totalTrades < 50 && (
              <>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={['#7C3AED', '#00FFB2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressBarFill,
                      { width: `${progressPercent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {totalTrades === 0
                    ? 'Complete your first trade to start building trust'
                    : `${progress.next - progress.current} more trade${progress.next - progress.current !== 1 ? 's' : ''} to reach ${progress.label}`
                  }
                </Text>
              </>
            )}

            {/* TRUST LEVELS */}
            <View style={styles.trustLevelsRow}>
              {[
                { icon: '🌱', label: 'New', trades: 1, color: '#00D4FF' },
                { icon: '⭐', label: 'Rising', trades: 6, color: '#7C3AED' },
                { icon: '🏅', label: 'Trusted', trades: 21, color: '#00FFB2' },
                { icon: '👑', label: 'Top', trades: 51, color: '#FFD166' },
              ].map((level) => (
                <View key={level.label} style={styles.trustLevel}>
                  <Text style={[
                    styles.trustLevelIcon,
                    { opacity: totalTrades >= level.trades ? 1 : 0.3 },
                  ]}>
                    {level.icon}
                  </Text>
                  <Text style={[
                    styles.trustLevelName,
                    {
                      color: totalTrades >= level.trades
                        ? level.color
                        : 'rgba(255,255,255,0.2)',
                    },
                  ]}>
                    {level.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* HOW TRUST WORKS */}
          {totalTrades === 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>
                🏅 How Trust Works
              </Text>
              <Text style={styles.infoCardText}>
                Your Trust Score starts at 0 and grows with every
                completed trade. After each trade, both parties leave
                reviews. The more positive reviews you collect, the
                higher your score climbs.{'\n\n'}
                Start by posting a listing or browsing what's available.
              </Text>
            </View>
          )}

          {/* STATS */}
          <View style={styles.statsRow}>
            {[
              {
                n: totalTrades,
                l: 'Total Trades',
                icon: '🔄',
                color: '#7C3AED',
              },
              {
                n: profile?.offeredSkillTagIds?.length || 0,
                l: 'Skills Offered',
                icon: '🛠️',
                color: '#00D4FF',
              },
              {
                n: profile?.desiredSkillTagIds?.length || 0,
                l: 'Skills Wanted',
                icon: '🤝',
                color: '#FF2D78',
              },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statNumber, { color: s.color }]}>
                  {s.n}
                </Text>
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>

          {/* SKILLS OFFERED */}
          {profile?.offeredSkillTagIds &&
            profile.offeredSkillTagIds.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🛠️ WHAT I OFFER</Text>
              <View style={styles.skillGrid}>
                {profile.offeredSkillTagIds.map((skill, i) => (
                  <View key={i} style={styles.skillChipOffer}>
                    <Text style={styles.skillTextOffer}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* SKILLS WANTED */}
          {profile?.desiredSkillTagIds &&
            profile.desiredSkillTagIds.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🤝 WHAT I NEED</Text>
              <View style={styles.skillGrid}>
                {profile.desiredSkillTagIds.map((skill, i) => (
                  <View key={i} style={styles.skillChipWant}>
                    <Text style={styles.skillTextWant}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ABOUT */}
          {profile?.skillDescription && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📝 ABOUT ME</Text>
              <Text style={styles.aboutText}>
                {profile.skillDescription}
              </Text>
            </View>
          )}

          {/* QUICK ACTIONS */}
          <View style={styles.actionsCard}>
            <Text style={styles.cardLabel}>QUICK ACTIONS</Text>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => navigation.navigate('PostBounty')}
            >
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={styles.actionText}>Post a New Listing</Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionRow}>
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>Edit Profile</Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionRow}>
              <Text style={styles.actionIcon}>⚖️</Text>
              <Text style={styles.actionText}>Dispute Panel</Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {/* SIGN OUT */}
          <TouchableOpacity
            style={styles.signOutCard}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <Text style={styles.signOutCardText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Barterly v1.0 · Free forever · No platform fees
          </Text>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', gap: 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.4)', fontSize: 14,
  },

  orb: { position: 'absolute', borderRadius: 9999 },
  orb1: {
    width: 300, height: 300,
    backgroundColor: '#7C3AED', opacity: 0.1,
    top: -100, right: -80,
  },
  orb2: {
    width: 200, height: 200,
    backgroundColor: '#FF2D78', opacity: 0.06,
    bottom: 300, left: -60,
  },
  orb3: {
    width: 150, height: 150,
    backgroundColor: '#00D4FF', opacity: 0.05,
    bottom: 100, right: -40,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { width: 60 },
  backText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14, fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17, fontWeight: '800',
    color: '#fff', letterSpacing: -0.3,
  },
  signOutBtn: { width: 60, alignItems: 'flex-end' },
  signOutText: {
    color: '#FF2D78', fontSize: 13, fontWeight: '600',
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  // PROFILE HERO
  profileHero: {
    alignItems: 'center', paddingVertical: 28,
  },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 36, fontWeight: '900', color: '#fff',
  },
  displayName: {
    fontSize: 24, fontWeight: '900',
    color: '#fff', letterSpacing: -0.5,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
  },

  // TRUST CARD
  trustCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    borderRadius: 20, padding: 20,
    marginBottom: 12,
  },
  trustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trustCardLabel: {
    fontSize: 10, fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2, marginBottom: 4,
  },
  trustScore: {
    fontSize: 42, fontWeight: '900',
    letterSpacing: -2, lineHeight: 48,
  },
  trustLevelLabel: {
    fontSize: 13, fontWeight: '700',
    marginTop: 2,
  },
  trustRingWrapper: {},
  trustRing: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    padding: 3,
  },
  trustRingInner: {
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: '#0D0A2E',
    alignItems: 'center', justifyContent: 'center',
  },
  trustRingNumber: {
    fontSize: 20, fontWeight: '900',
    color: '#fff', letterSpacing: -0.5,
  },
  trustRingLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.3)',
    marginTop: -2,
  },

  // PROGRESS
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3, overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%', borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 16, lineHeight: 17,
  },

  // TRUST LEVELS
  trustLevelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trustLevel: { alignItems: 'center', gap: 4 },
  trustLevelIcon: { fontSize: 20 },
  trustLevelName: {
    fontSize: 10, fontWeight: '700',
  },

  // INFO CARD
  infoCard: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    borderRadius: 16, padding: 16,
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 14, fontWeight: '800',
    color: '#A78BFA', marginBottom: 10,
  },
  infoCardText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 20,
  },

  // STATS
  statsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 4,
  },
  statIcon: { fontSize: 20 },
  statNumber: {
    fontSize: 22, fontWeight: '900', letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center', letterSpacing: 0.3,
  },

  // CARDS
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10, fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2, marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 21, fontWeight: '300',
  },

  // SKILLS
  skillGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  skillChipOffer: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.4)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  skillTextOffer: {
    fontSize: 11, color: '#A78BFA',
    fontWeight: '700', letterSpacing: 0.3,
  },
  skillChipWant: {
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.3)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  skillTextWant: {
    fontSize: 11, color: '#00D4FF',
    fontWeight: '700', letterSpacing: 0.3,
  },

  // ACTIONS
  actionsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 16,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center', gap: 12,
    paddingVertical: 12,
  },
  actionIcon: { fontSize: 18 },
  actionText: {
    flex: 1, fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  actionArrow: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 16,
  },
  actionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // SIGN OUT
  signOutCard: {
    backgroundColor: 'rgba(255,45,120,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,45,120,0.2)',
    borderRadius: 16, padding: 16,
    alignItems: 'center', marginBottom: 16,
  },
  signOutCardText: {
    color: '#FF2D78', fontSize: 15, fontWeight: '700',
  },

  footer: {
    textAlign: 'center', fontSize: 11,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 0.3, marginBottom: 20,
  },
});