import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useEffect } from 'react';
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
    desc: 'Combine cash with goods to balance any unequal trade.',
    color: '#00D4FF',
  },
  {
    icon: '🛠️',
    title: 'Skill Swaps',
    desc: 'Trade your expertise for goods or other services.',
    color: '#FF2D78',
  },
  {
    icon: '🤖',
    title: 'AI 3-Way Match',
    desc: 'Our AI finds chain trades that humans could never discover alone.',
    color: '#00FFB2',
  },
  {
    icon: '⚖️',
    title: 'Dispute Panel',
    desc: 'Community-elected members resolve disputes fairly and transparently.',
    color: '#FFD166',
  },
  {
    icon: '🏅',
    title: 'Trust System',
    desc: 'Scores built from real reviews. Zero trades = zero score. Earn it.',
    color: '#FF8C42',
  },
];

const LIVE_TRADES = [
  {
    emoji: '🎸',
    title: 'Fender Guitar 1998',
    wants: 'Road bike or camera',
    user: '@marina_k',
    trades: 12,
    type: 'TRADE',
  },
  {
    emoji: '💻',
    title: 'MacBook Pro M3',
    wants: 'DSLR + $200',
    user: '@devdude',
    trades: 8,
    type: 'HYBRID',
  },
  {
    emoji: '🔧',
    title: 'Plumbing Service',
    wants: 'Logo design',
    user: '@fixpro',
    trades: 31,
    type: 'SERVICE',
  },
];

// Helper for trust label
const getTrustLabel = (trades: number) => {
  if (trades === 0) return 'No trades yet';
  if (trades <= 5) return 'New Trader';
  if (trades <= 20) return 'Rising Trader';
  if (trades <= 50) return 'Trusted Trader';
  return 'Top Trader';
};

export default function LandingScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
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
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.navLoginBtn}
            >
              <Text style={styles.navLoginText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* HERO */}
          <Animated.View
            style={[
              styles.hero,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>
                THE MODERN EXCHANGE PLATFORM
              </Text>
            </View>

            <Text style={styles.heroTitle}>
              Trade goods.{'\n'}
              Share skills.{'\n'}
              <Text style={styles.heroAccent}>
                Skip the{'\n'}middleman.
              </Text>
            </Text>

            <Text style={styles.heroSub}>
              Barterly is a peer-to-peer exchange platform where you trade
              what you have for what you need. Goods, services, skills, or
              cash. Free forever. No platform fees.
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
                <Text style={styles.primaryBtnText}>
                  Start Trading Free →
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.secondaryBtnText}>
                Already a trader?{' '}
                <Text style={styles.secondaryBtnAccent}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* LIVE TRADES */}
          <View style={styles.section}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE TRADES</Text>
            </View>

            {LIVE_TRADES.map((trade, i) => (
              <View key={i} style={styles.tradeCard}>
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
                  <Text style={styles.tradeTrust}>
                    {getTrustLabel(trade.trades)}
                  </Text>
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
              { n: '∞', l: 'Trades' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statNumber}>{s.n}</Text>
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>

          {/* FEATURES */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHY BARTERLY</Text>
            <Text style={styles.sectionTitle}>
              Everything you need to trade.
            </Text>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={[
                  styles.featureIconBox,
                  { backgroundColor: f.color + '22' },
                ]}>
                  <Text style={{ fontSize: 22 }}>{f.icon}</Text>
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* HOW IT WORKS */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
            <Text style={styles.sectionTitle}>Simple as a handshake.</Text>
            {[
              {
                n: '01',
                icon: '📦',
                title: 'Post Your Listing',
                desc: 'List what you have with photos and a description. Set your exchange type.',
              },
              {
                n: '02',
                icon: '🔍',
                title: 'Browse & Match',
                desc: 'Search listings or let AI suggest matches based on what you need.',
              },
              {
                n: '03',
                icon: '💬',
                title: 'Negotiate',
                desc: 'Chat and agree on terms. Counter-offer, add cash, suggest alternatives.',
              },
              {
                n: '04',
                icon: '✅',
                title: 'Complete & Review',
                desc: 'Finish the trade, leave an honest review. Build your Trust Score.',
              },
            ].map((step, i) => (
              <View key={i} style={styles.stepCard}>
                <LinearGradient
                  colors={['#7C3AED', '#FF2D78']}
                  style={styles.stepNumber}
                >
                  <Text style={styles.stepNumberText}>{step.n}</Text>
                </LinearGradient>
                <View style={styles.stepContent}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* TRUST SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TRUST SYSTEM</Text>
            <Text style={styles.sectionTitle}>
              Earn your reputation.
            </Text>
            <Text style={styles.sectionSub}>
              Every trader starts at zero. Your Trust Score is built
              entirely from real reviews after completed trades.
              No shortcuts. No fake scores.
            </Text>
            <View style={styles.trustLevels}>
              {[
                { icon: '🌱', label: 'New Trader', range: '1-5 trades', color: '#00D4FF' },
                { icon: '⭐', label: 'Rising Trader', range: '6-20 trades', color: '#7C3AED' },
                { icon: '🏅', label: 'Trusted Trader', range: '21-50 trades', color: '#00FFB2' },
                { icon: '👑', label: 'Top Trader', range: '51+ trades', color: '#FFD166' },
              ].map((level, i) => (
                <View key={i} style={styles.trustLevel}>
                  <Text style={styles.trustLevelIcon}>{level.icon}</Text>
                  <View style={styles.trustLevelInfo}>
                    <Text style={[
                      styles.trustLevelLabel,
                      { color: level.color },
                    ]}>
                      {level.label}
                    </Text>
                    <Text style={styles.trustLevelRange}>{level.range}</Text>
                  </View>
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
              Join thousands of traders already exchanging — free forever,
              community powered.
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
                <Text style={styles.primaryBtnText}>
                  Join Barterly Free →
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <View style={styles.footerLogoRow}>
              <LinearGradient
                colors={['#7C3AED', '#FF2D78']}
                style={styles.footerLogoMark}
              >
                <Text style={styles.logoMarkText}>B</Text>
              </LinearGradient>
              <Text style={styles.footerLogoText}>Barterly</Text>
            </View>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLink}>How it Works</Text>
              <Text style={styles.footerLink}>Trust System</Text>
              <Text style={styles.footerLink}>Dispute Panel</Text>
              <Text style={styles.footerLink}>Privacy</Text>
            </View>
            <Text style={styles.footerCopy}>
              © 2026 Barterly · Trade fair, trade free
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },

  // ORBS
  orb: { position: 'absolute', borderRadius: 9999 },
  orb1: {
    width: 300, height: 300,
    backgroundColor: '#7C3AED',
    opacity: 0.12,
    top: -100, right: -80,
  },
  orb2: {
    width: 200, height: 200,
    backgroundColor: '#00D4FF',
    opacity: 0.07,
    top: height * 0.4, left: -60,
  },
  orb3: {
    width: 250, height: 250,
    backgroundColor: '#FF2D78',
    opacity: 0.06,
    bottom: 100, right: -60,
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
    width: 36, height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  logoText: {
    fontSize: 20, fontWeight: '800',
    color: '#fff', letterSpacing: -0.5,
  },
  navLoginBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  navLoginText: {
    color: '#fff', fontSize: 13, fontWeight: '600',
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
    width: 6, height: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10, color: '#A78BFA',
    fontWeight: '600', letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 44, fontWeight: '900',
    color: '#fff', lineHeight: 50,
    letterSpacing: -1, marginBottom: 20,
  },
  heroAccent: { color: '#7C3AED' },
  heroSub: {
    fontSize: 15, color: 'rgba(255,255,255,0.5)',
    lineHeight: 23, marginBottom: 32, fontWeight: '300',
  },

  // BUTTONS
  primaryBtn: { borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  primaryBtnGradient: {
    padding: 18, alignItems: 'center', borderRadius: 12,
  },
  primaryBtnText: {
    color: '#fff', fontSize: 16,
    fontWeight: '700', letterSpacing: 0.3,
  },
  secondaryBtn: { alignItems: 'center' },
  secondaryBtnText: {
    fontSize: 14, color: 'rgba(255,255,255,0.4)',
  },
  secondaryBtnAccent: { color: '#7C3AED', fontWeight: '700' },

  // SECTION
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionLabel: {
    fontSize: 10, color: '#7C3AED',
    fontWeight: '700', letterSpacing: 2, marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 26, fontWeight: '900',
    color: '#fff', letterSpacing: -0.5,
    marginBottom: 8, lineHeight: 32,
  },
  sectionSub: {
    fontSize: 14, color: 'rgba(255,255,255,0.4)',
    lineHeight: 22, marginBottom: 20, fontWeight: '300',
  },

  // LIVE TRADES
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, marginBottom: 16,
  },
  liveDot: {
    width: 8, height: 8,
    backgroundColor: '#00FFB2', borderRadius: 4,
  },
  liveText: {
    fontSize: 11, color: '#00FFB2',
    fontWeight: '600', letterSpacing: 1.5,
  },
  tradeCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    width: 44, height: 44,
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
    fontSize: 10, color: '#A78BFA',
    fontWeight: '700', letterSpacing: 0.5,
  },
  tradeTitle: {
    fontSize: 16, fontWeight: '800',
    color: '#fff', marginBottom: 6,
    letterSpacing: -0.3,
  },
  tradeWants: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tradeWantsLabel: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  tradeWantsArrow: { fontSize: 13, color: '#7C3AED' },
  tradeWantsValue: {
    fontSize: 13, color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  tradeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  tradeUser: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  tradeTrust: {
    fontSize: 12, color: '#00FFB2', fontWeight: '600',
  },

  // STATS
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
  },
  statItem: { alignItems: 'center' },
  statNumber: {
    fontSize: 22, fontWeight: '900',
    color: '#fff', letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.4)',
    marginTop: 2, letterSpacing: 0.3,
  },

  // FEATURES
  featureCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  featureIconBox: {
    width: 48, height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 15, fontWeight: '800',
    color: '#fff', marginBottom: 4,
    letterSpacing: -0.2,
  },
  featureDesc: {
    fontSize: 13, color: 'rgba(255,255,255,0.5)',
    lineHeight: 19,
  },

  // STEPS
  stepCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 36, height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 11, fontWeight: '900',
    color: '#fff', letterSpacing: 0.5,
  },
  stepContent: { flex: 1 },
  stepIcon: { fontSize: 18, marginBottom: 4 },
  stepTitle: {
    fontSize: 15, fontWeight: '800',
    color: '#fff', marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)',
    lineHeight: 19,
  },

  // TRUST LEVELS
  trustLevels: {
    gap: 10,
    marginTop: 8,
  },
  trustLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
  },
  trustLevelIcon: { fontSize: 24 },
  trustLevelInfo: { flex: 1 },
  trustLevelLabel: {
    fontSize: 14, fontWeight: '800',
    marginBottom: 2,
  },
  trustLevelRange: {
    fontSize: 12, color: 'rgba(255,255,255,0.35)',
  },

  // CTA
  ctaSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 36, fontWeight: '900',
    color: '#fff', textAlign: 'center',
    letterSpacing: -1, marginBottom: 12,
    lineHeight: 42,
  },
  ctaAccent: { color: '#FF2D78' },
  ctaSub: {
    fontSize: 14, color: 'rgba(255,255,255,0.45)',
    textAlign: 'center', lineHeight: 22,
    marginBottom: 28, maxWidth: 300,
  },

  // FOOTER
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 16,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerLogoMark: {
    width: 32, height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLogoText: {
    fontSize: 18, fontWeight: '800',
    color: '#fff',
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  footerLink: {
    fontSize: 13, color: 'rgba(255,255,255,0.35)',
  },
  footerCopy: {
    fontSize: 12, color: 'rgba(255,255,255,0.2)',
    letterSpacing: 0.3,
  },
});