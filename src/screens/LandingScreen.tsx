import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Dimensions, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const FEATURES = [
  {
    icon: '⇄',
    title: 'THE LOOP',
    desc: "Our AI finds the dots you can't see, creating 3-way matches so everyone gets what they need.",
    iconBg: '#E8F5E0',
  },
  {
    icon: '🔒',
    title: 'KARMA JAIL',
    desc: "Accountability is our currency. Ghost a neighbor? You're in Karma Jail until you make it right.",
    iconBg: '#FFEDED',
  },
  {
    icon: '⚖️',
    title: 'COMMUNITY JURY',
    desc: 'No bots here. When disputes happen, the Elders of the neighborhood decide the outcome.',
    iconBg: '#E8F5E0',
  },
];

const SAMPLE_BOUNTIES = [
  { icon: '⚡', category: 'Yard Work', title: 'MOW MY FRONT LAWN', karma: 2 },
  { icon: '🔧', category: 'Plumbing', title: 'FIX LEAKY BATHROOM FAUCET', karma: 5 },
  { icon: '🐕', category: 'Pet Care', title: 'DOG SITTING (SATURDAY)', karma: 3 },
];

export default function LandingScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView
      style={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      {/* NAV */}
      <SafeAreaView style={styles.nav}>
        <View style={styles.navInner}>
          <View style={styles.navLogo}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>⇄</Text>
            </View>
            <Text style={styles.logoText}>Barterly</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.villageTag}>
          <Text style={styles.villageTagText}>The Digital Village is Open</Text>
        </View>

        <Text style={styles.heroTitle}>
          Bringing the{'\n'}Barter System{'\n'}
          <Text style={styles.heroAccent}>Back to the{'\n'}Future</Text>
        </Text>

        <Text style={styles.heroSub}>
          Technology should bring us closer, not just handle our payments. Join a cashless movement that turns your hidden talents into the help you need today.
        </Text>

        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={styles.joinBtnText}>Join the Neighborhood</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLink}>Already a neighbor? Neighbor Login</Text>
        </TouchableOpacity>
      </View>

      {/* FEATURES SECTION */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTag}>WHY BARTERLY</Text>
        <Text style={styles.sectionTitle}>THRIVING VILLAGE{'\n'}ECONOMY</Text>
        <Text style={styles.sectionSub}>
          Modular tools built for trust, accountability, and seamless exchange.
        </Text>

        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: f.iconBg }]}>
              <Text style={styles.featureIconText}>{f.icon}</Text>
            </View>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      {/* BOUNTIES SECTION */}
      <View style={styles.bountiesSection}>
        <View style={styles.bountiesTag}>
          <Text style={styles.bountiesTagText}>Live Bounties</Text>
        </View>
        <Text style={styles.bountiesTitle}>COMMUNITY BOUNTIES</Text>
        <Text style={styles.bountiesSub}>
          Neighbors are looking for specific hands. Step in, help out, and earn Karma instantly.
        </Text>

        <TouchableOpacity
          style={styles.viewBountiesBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.viewBountiesBtnText}>View All Bounties →</Text>
        </TouchableOpacity>

        {SAMPLE_BOUNTIES.map((b, i) => (
          <View key={i} style={styles.bountyCard}>
            <View style={styles.bountyCardTop}>
              <View style={styles.bountyIconBox}>
                <Text style={styles.bountyIcon}>{b.icon}</Text>
              </View>
              <View style={styles.bountyCategory}>
                <Text style={styles.bountyCategoryText}>{b.category}</Text>
              </View>
            </View>
            <Text style={styles.bountyTitle}>{b.title}</Text>
            <View style={styles.karmaRow}>
              <Text style={styles.karmaCoin}>🪙</Text>
              <Text style={styles.karmaText}>{b.karma} Karma</Text>
            </View>
          </View>
        ))}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerLogoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>⇄</Text>
          </View>
          <Text style={styles.footerLogoText}>Barterly</Text>
        </View>

        <Text style={styles.footerQuote}>
          "Using technology to bring the village back to life,{'\n'}one handshake at a time."
        </Text>

        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={styles.joinBtnText}>Join the Neighborhood</Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>NEIGHBORHOOD</Text>
            <Text style={styles.footerLink}>Safety Center</Text>
            <Text style={styles.footerLink}>Trade Rules</Text>
            <Text style={styles.footerLink}>Karma System</Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>CONNECT</Text>
            <Text style={styles.footerLink}>Help Desk</Text>
            <Text style={styles.footerLink}>Discord</Text>
            <Text style={styles.footerLink}>Instagram</Text>
          </View>
        </View>

        <Text style={styles.copyright}>© 2026 Barterly. Built by neighbors.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },

  // NAV
  nav: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  navInner: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#6AAF45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: { fontSize: 18, color: '#fff' },
  logoText: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },

  // HERO
  hero: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
    alignItems: 'center',
  },
  villageTag: {
    borderWidth: 1,
    borderColor: '#6AAF45',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 28,
  },
  villageTagText: {
    color: '#6AAF45',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 46,
    marginBottom: 20,
  },
  heroAccent: {
    color: '#6AAF45',
    fontWeight: '800',
  },
  heroSub: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 36,
    fontWeight: '400',
    paddingHorizontal: 8,
  },
  joinBtn: {
    backgroundColor: '#6AAF45',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    shadowColor: '#6AAF45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  loginLink: {
    color: '#6AAF45',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },

  // FEATURES
  featuresSection: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6AAF45',
    letterSpacing: 2,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    lineHeight: 34,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  sectionSub: {
    fontSize: 14,
    color: '#777',
    lineHeight: 21,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureIconText: { fontSize: 24 },
  featureTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1A1A1A',
    fontStyle: 'italic',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  featureDesc: {
    fontSize: 14,
    color: '#777',
    lineHeight: 21,
  },

  // BOUNTIES
  bountiesSection: {
    backgroundColor: '#F2F2F2',
    padding: 28,
  },
  bountiesTag: {
    backgroundColor: '#E8F5E0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  bountiesTagText: { color: '#6AAF45', fontSize: 12, fontWeight: '600' },
  bountiesTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1A1A',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  bountiesSub: {
    fontSize: 14,
    color: '#777',
    lineHeight: 21,
    marginBottom: 20,
  },
  viewBountiesBtn: {
    borderWidth: 1.5,
    borderColor: '#6AAF45',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  viewBountiesBtnText: { color: '#6AAF45', fontSize: 15, fontWeight: '700' },
  bountyCard: {
    backgroundColor: '#EBEBEB',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  bountyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bountyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6AAF45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bountyIcon: { fontSize: 22 },
  bountyCategory: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bountyCategoryText: { fontSize: 12, color: '#6AAF45', fontWeight: '600' },
  bountyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1A1A1A',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  karmaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  karmaCoin: { fontSize: 20 },
  karmaText: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },

  // FOOTER
  footer: {
    backgroundColor: '#1A1A1A',
    padding: 32,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  footerLogoText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  footerQuote: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    lineHeight: 23,
    marginBottom: 24,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 24,
    marginBottom: 24,
  },
  footerCol: { gap: 10 },
  footerColTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6AAF45',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  footerLink: { fontSize: 14, color: 'rgba(255,255,255,0.45)' },
  copyright: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
});