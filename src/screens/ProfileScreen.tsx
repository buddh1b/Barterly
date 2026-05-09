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
import { UserProfile } from '../types';

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
      'Leave the Village?',
      'Are you sure you want to sign out?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(auth),
        },
      ]
    );
  };

  const getKarmaLevel = (karma: number) => {
    if (karma >= 90) return { label: 'Village Elder', color: '#FFD166', icon: '👑' };
    if (karma >= 70) return { label: 'Trusted Trader', color: '#00FFB2', icon: '🏅' };
    if (karma >= 50) return { label: 'Active Neighbor', color: '#7C3AED', icon: '⭐' };
    if (karma >= 20) return { label: 'New Neighbor', color: '#00D4FF', icon: '🌱' };
    return { label: 'Getting Started', color: '#FF2D78', icon: '🔑' };
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0A0015', '#0D0A2E', '#0A1628']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading your porch...</Text>
      </LinearGradient>
    );
  }

  const karma = profile?.karmaBalance || 0;
  const karmaLevel = getKarmaLevel(karma);
  const karmaPercent = Math.min(karma, 100);

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
          <Text style={styles.headerTitle}>My Porch</Text>
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
            {/* AVATAR */}
            <LinearGradient
              colors={['#7C3AED', '#FF2D78']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {profile?.displayName?.[0]?.toUpperCase() ||
                  user?.displayName?.[0]?.toUpperCase() || '?'}
              </Text>
            </LinearGradient>

            {/* NAME & LEVEL */}
            <Text style={styles.displayName}>
              {profile?.displayName || user?.displayName || 'Neighbor'}
            </Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelIcon}>{karmaLevel.icon}</Text>
              <Text style={[styles.levelLabel, { color: karmaLevel.color }]}>
                {karmaLevel.label}
              </Text>
            </View>
            <Text style={styles.email}>{profile?.email || user?.email}</Text>
          </View>

          {/* KARMA CARD */}
          <View style={styles.karmaCard}>
            <View style={styles.karmaHeader}>
              <View>
                <Text style={styles.karmaLabel}>TRUST SCORE</Text>
                <Text style={styles.karmaNumber}>{karma}</Text>
              </View>
              <LinearGradient
                colors={['#7C3AED', '#00FFB2']}
                style={styles.karmaRing}
              >
                <View style={styles.karmaRingInner}>
                  <Text style={styles.karmaRingText}>{karma}</Text>
                  <Text style={styles.karmaRingSubtext}>/100</Text>
                </View>
              </LinearGradient>
            </View>

            {/* KARMA BAR */}
            <View style={styles.karmaBarBg}>
              <LinearGradient
                colors={['#7C3AED', '#00FFB2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.karmaBarFill,
                  { width: `${karmaPercent}%` }
                ]}
              />
            </View>

            {/* KARMA MILESTONES */}
            <View style={styles.milestonesRow}>
              {[
                { score: 20, label: 'New', icon: '🌱' },
                { score: 50, label: 'Active', icon: '⭐' },
                { score: 70, label: 'Trusted', icon: '🏅' },
                { score: 90, label: 'Elder', icon: '👑' },
              ].map((m) => (
                <View key={m.score} style={styles.milestone}>
                  <Text style={styles.milestoneIcon}>{m.icon}</Text>
                  <Text style={[
                    styles.milestoneLabel,
                    karma >= m.score && styles.milestoneLabelActive,
                  ]}>
                    {m.label}
                  </Text>
                  <Text style={[
                    styles.milestoneScore,
                    karma >= m.score && styles.milestoneScoreActive,
                  ]}>
                    {m.score}+
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* STATS ROW */}
          <View style={styles.statsRow}>
            {[
              {
                n: profile?.tradesRemaining || 0,
                l: 'Trades Left',
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

          {/* LOCATION CARD */}
          {profile?.zipCode && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📍 PORCH LOCATION</Text>
              <Text style={styles.cardValue}>
                {profile.formattedAddress || profile.zipCode}
              </Text>
              {profile.zipCode && (
                <Text style={styles.cardSub}>ZIP: {profile.zipCode}</Text>
              )}
            </View>
          )}

          {/* SKILLS OFFERED */}
          {profile?.offeredSkillTagIds &&
            profile.offeredSkillTagIds.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>🔨 WHAT I OFFER</Text>
              <View style={styles.skillGrid}>
                {profile.offeredSkillTagIds.map((skill, i) => (
                  <View key={i} style={styles.skillChipOffer}>
                    <Text style={styles.skillChipTextOffer}>{skill}</Text>
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
                    <Text style={styles.skillChipTextWant}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* DESCRIPTION */}
          {profile?.skillDescription && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>📝 ABOUT ME</Text>
              <Text style={styles.descText}>
                {profile.skillDescription}
              </Text>
            </View>
          )}

          {/* COMMUNITY RULES */}
          <View style={styles.rulesCard}>
            <Text style={styles.cardLabel}>⚖️ COMMUNITY RULES</Text>
            {[
              { icon: '✅', text: 'Be honest about what you\'re trading' },
              { icon: '✅', text: 'Complete deals you agree to' },
              { icon: '✅', text: 'Rate traders fairly after each exchange' },
              { icon: '❌', text: 'Don\'t ghost confirmed deals' },
              { icon: '❌', text: 'Don\'t misrepresent items or services' },
            ].map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <Text style={styles.ruleIcon}>{rule.icon}</Text>
                <Text style={styles.ruleText}>{rule.text}</Text>
              </View>
            ))}
          </View>

          {/* SIGN OUT */}
          <TouchableOpacity
            style={styles.signOutCard}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <Text style={styles.signOutCardText}>
              🚪 Leave the Village
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Member since{' '}
            {profile?.createdAt?.toDate?.()?.getFullYear?.() || '2026'}
            {' '}· Barterly v1.0
          </Text>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },

  orb: { position: 'absolute', borderRadius: 9999 },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: '#7C3AED',
    opacity: 0.1,
    top: -100,
    right: -80,
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: '#FF2D78',
    opacity: 0.06,
    bottom: 300,
    left: -60,
  },
  orb3: {
    width: 150,
    height: 150,
    backgroundColor: '#00D4FF',
    opacity: 0.05,
    bottom: 100,
    right: -40,
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
  signOutBtn: { width: 60, alignItems: 'flex-end' },
  signOutText: {
    color: '#FF2D78',
    fontSize: 13,
    fontWeight: '600',
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  // PROFILE HERO
  profileHero: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  displayName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 8,
  },
  levelIcon: { fontSize: 16 },
  levelLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  email: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '400',
  },

  // KARMA CARD
  karmaCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  karmaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  karmaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  karmaNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  karmaRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  karmaRingInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#0D0A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  karmaRingText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  karmaRingSubtext: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    marginTop: -2,
  },
  karmaBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  karmaBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestonesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestone: { alignItems: 'center', gap: 2 },
  milestoneIcon: { fontSize: 16 },
  milestoneLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '600',
  },
  milestoneLabelActive: { color: '#fff' },
  milestoneScore: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.15)',
    fontFamily: 'monospace',
  },
  milestoneScoreActive: { color: '#A78BFA' },

  // STATS ROW
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: { fontSize: 20 },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // CARDS
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },

  // SKILLS
  skillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChipOffer: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skillChipTextOffer: {
    fontSize: 11,
    color: '#A78BFA',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  skillChipWant: {
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skillChipTextWant: {
    fontSize: 11,
    color: '#00D4FF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // DESCRIPTION
  descText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 22,
    fontWeight: '300',
  },

  // RULES
  rulesCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  ruleIcon: { fontSize: 14 },
  ruleText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 19,
    flex: 1,
  },

  // SIGN OUT
  signOutCard: {
    backgroundColor: 'rgba(255,45,120,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,45,120,0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  signOutCardText: {
    color: '#FF2D78',
    fontSize: 15,
    fontWeight: '700',
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
});