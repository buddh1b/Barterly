import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions, Animated, useEffect,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useEffect as UseEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  {
    icon: '🔄',
    title: 'Pure Barter',
    desc: 'Trade goods for goods. Zero cash, zero fees, zero middlemen.',
    color: '#7C3AED',
  },
  {
    icon: '💵',
    title: 'Cash + Trade',
    desc: 'Combine cash with goods to balance any unequal trade perfectly.',
    color: '#00D4FF',
  },
  {
    icon: '🛠️',
    title: 'Skill Swaps',
    desc: 'Trade your expertise for goods or other services. Time is currency.',
    color: '#FF2D78',
  },
  {
    icon: '🤖',
    title: 'AI 3-Way Match',
    desc: 'Our AI finds chain trades that humans could never discover alone.',
    color: '#00FFB2',
  },
];

const LIVE_TRADES = [
  { emoji: '🎸', title: 'Fender Guitar', wants: 'Road bike', user: '@marina', score: 97, type: 'TRADE' },
  { emoji: '💻', title: 'MacBook Pro M3', wants: 'Camera + $200', user: '@devdude', score: 94, type: 'HYBRID' },
  { emoji: '🔧', title: 'Plumbing Service', wants: 'Logo design', user: '@fixpro', score: 91, type: 'SERVICE' },
];

export default function LandingScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  UseEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#0A0015', '#0D0A2E', '#0A1628']}
      style={styles.container}
    >
      {/* FLOATING ORBS */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* NAV */}
          <View style={styles.nav}>
            <View style={styles.logoRow}>
              <LinearGradient
                colors={['#7C3AED', '#FF2D78']}
                style={styles.logoMark}
              >
                <Text style={styles.logoMarkText}>B</Text>
              </LinearGradient>
              <Text style={styles.logoText}>Barterly</Text>
            </View>
          </View>

          {/* HERO */}
          <Animated.View
            style={[
              styles.hero,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>THE MODERN EXCHANGE PLATFORM</Text>
            </View>

            <Text style={styles.heroTitle}>
              Trade goods.{'\n'}
              Share skills.{'\n'}
              <Text style={styles.heroAccent}>Skip the{'\n'}middleman.</Text>
            </Text>

            <Text style={styles.heroSub}>
              Peer-to-peer exchange for goods, services, and skills. Fair value. Real community. Zero fees.
            </Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#7C3AED', '#FF2D78']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>Start Trading Free →</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.secondaryBtnText}>
                Already trading?{' '}
                <Text style={styles.secondaryBtnAccent}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* LIVE TRADE CARDS */}
          <View style={styles.liveSection}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE TRADES</Text>
            </View>
            {LIVE_TRADES.map((trade, i) => (
              <View key={i} style={styles.glassCard}>
                <View style={styles.tradeCardTop}>
                  <View style={styles.tradeEmoji}>
                    <Text style={{ fontSize: 24 }}>{trade.emoji}</Text>
                  </View>
                  <View style={styles.tradeTypeTag}>
                    <Text style={styles.tradeTypeText}>{trade.type}</Text>
                  </View>
                </View>
                <Text style={styles.tradeTitle}>{trade.title}</Text>
                <View style={styles.tradeWants}>
                  <Text style={styles.tradeWantsLabel}>Wants </Text>
                  <Text style={styles.tradeWantsArrow}>→ </Text>
                  <Text style={styles.tradeWantsValue}>{trade.wants}</Text>
                </View>
                <View style={styles.tradeFooter}>
                  <Text style={styles.tradeUser}>{trade.user}</Text>
                  <Text style={styles.tradeScore}>✦ {trade.score}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* STATS */}
          <View style={styles.statsRow}>
            {[
              { n: '24K+', l: 'Traders' },
              { n: '$2.4M', l: 'Exchanged' },
              { n: '0%', l: 'Fees' },
              { n: '98%', l: 'Satisfied' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statNumber}>{s.n}</Text>
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>

          {/* FEATURES */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionLabel}>WHY BARTERLY</Text>
            <Text style={styles.sectionTitle}>Six ways to exchange.</Text>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={[styles.featureIconBox, { backgroundColor: f.color + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{f.icon}</Text>
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* TRUST */}
          <View style={styles.trustSection}>
            <Text style={styles.sectionLabel}>TRUST & SAFETY</Text>
            <Text style={styles.sectionTitle}>A community that keeps itself honest.</Text>
            <View style={styles.trustGrid}>
              {[
                { icon: '⚖️', title: 'Community Jury', desc: 'Disputes resolved by elected neighbors, not bots.' },
                { icon: '🔒', title: 'Accountability', desc: 'Ghost a deal? Restricted until resolved.' },
                { icon: '🏅', title: 'Trust Score', desc: 'Your reputation, built trade by trade.' },
                { icon: '🛡️', title: 'Verified Listings', desc: 'Community-reviewed before going live.' },
              ].map((t, i) => (
                <View key={i} style={styles.trustCard}>
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</Text>
                  <Text style={styles.trustCardTitle}>{t.title}</Text>
                  <Text style={styles.trustCardDesc}>{t.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>
              Ready to trade{'\n'}
              <Text style={styles.ctaAccent}>smarter?</Text>
            </Text>
            <Text style={styles.ctaSub}>
              Join 24,800+ traders already exchanging — commission free, community powered.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#7C3AED', '#FF2D78']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnGradient}
              >
                <Text style={styles.primaryBtnText}>Join the Village →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 Barterly · Trade fair, trade free</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const GLASS = {
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },

  // ORBS
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.15,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: '#7C3AED',
    top: -100,
    right: -80,
    transform: [{ scale: 1.2 }],
  },
  orb2: {
    width: 200,
    height: 200,
    backgroundColor: '#00D4FF',
    top: height * 0.4,
    left: -60,
  },
  orb3: {
    width: 250,
    height: 250,
    backgroundColor: '#FF2D78',
    bottom: 100,
    right: -60,
    opacity: 0.1,
  },

  // NAV
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },

  // HERO
  hero: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  badgeDot: {
    width: 6,
    height: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    color: '#A78BFA',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 50,
    letterSpacing: -1,
    marginBottom: 20,
  },
  heroAccent: { color: '#7C3AED' },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 23,
    marginBottom: 32,
    fontWeight: '300',
  },

  // BUTTONS
  primaryBtn: { borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  primaryBtnGradient: {
    padding: 18,
    alignItems: 'center',
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryBtn: { alignItems: 'center' },
  secondaryBtnText: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  secondaryBtnAccent: { color: '#7C3AED', fontWeight: '700' },

  // LIVE TRADES
  liveSection: { paddingHorizontal: 24, marginBottom: 32 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: '#00FFB2',
    borderRadius: 4,
  },
  liveText: {
    fontSize: 11,
    color: '#00FFB2',
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  glassCard: {
    ...GLASS,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  tradeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tradeEmoji: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeTypeTag: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tradeTypeText: {
    fontSize: 10,
    color: '#A78BFA',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tradeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  tradeWants: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tradeWantsLabel: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  tradeWantsArrow: { fontSize: 13, color: '#7C3AED' },
  tradeWantsValue: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  tradeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  tradeUser: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  tradeScore: { fontSize: 12, color: '#00FFB2', fontWeight: '600' },

  // STATS
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginHorizontal: 24,
    marginBottom: 32,
    ...GLASS,
    borderRadius: 16,
  },
  statItem: { alignItems: 'center' },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
    letterSpacing: 0.3,
  },

  // FEATURES
  featuresSection: { paddingHorizontal: 24, marginBottom: 32 },
  sectionLabel: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 20,
    lineHeight: 32,
  },
  featureCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    ...GLASS,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  featureDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 19,
  },

  // TRUST
  trustSection: { paddingHorizontal: 24, marginBottom: 32 },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  trustCard: {
    ...GLASS,
    borderRadius: 14,
    padding: 16,
    width: (width - 58) / 2,
  },
  trustCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  trustCardDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 17,
  },

  // CTA
  ctaSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 12,
    lineHeight: 42,
  },
  ctaAccent: { color: '#FF2D78' },
  ctaSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 300,
  },

  // FOOTER
  footer: { alignItems: 'center', paddingBottom: 20 },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 0.5,
  },
});