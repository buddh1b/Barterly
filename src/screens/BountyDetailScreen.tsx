import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Dimensions, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bounty, getTrustLabel, getTrustColor } from '../types';

const { width } = Dimensions.get('window');

const TYPE_GRADIENTS: Record<string, [string, string]> = {
  OFFER: ['#7C3AED', '#A855F7'],
  REQUEST: ['#FF2D78', '#FF6B9D'],
  TRADE: ['#7C3AED', '#A855F7'],
  CASH: ['#059669', '#10B981'],
  HYBRID: ['#D97706', '#F59E0B'],
  SERVICE: ['#FF2D78', '#FF6B9D'],
};

const EXCHANGE_LABELS: Record<string, string> = {
  TRADE: '🔄 Pure Trade',
  CASH: '💵 Cash Only',
  HYBRID: '⚖️ Trade + Cash',
  SERVICE: '🛠️ Skill Swap',
};

export default function BountyDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bounty: Bounty = route.params?.bounty;
  const user = auth.currentUser;
  const isOwner = user?.uid === bounty?.creatorId;

  const trustLabel = getTrustLabel(bounty?.creatorTrustScore || 0);
  const trustColor = getTrustColor(bounty?.creatorTrustScore || 0);
  const typeGradient = TYPE_GRADIENTS[bounty?.type] ||
    ['#7C3AED', '#FF2D78'];

  if (!bounty) {
    return (
      <LinearGradient
        colors={['#0A0015', '#0D0A2E', '#0A1628']}
        style={styles.container}
      >
        <SafeAreaView style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
          <Text style={styles.errorText}>Listing not found</Text>
          <TouchableOpacity
            style={styles.errorBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const handleInterest = () => {
    if (isOwner) {
      Alert.alert(
        'Your Listing',
        'This is your own listing. You cannot express interest in your own trade.'
      );
      return;
    }
    Alert.alert(
      '🤝 Interest Noted!',
      `We'll notify ${bounty.creatorDisplayName} that you're interested. They'll reach out to discuss the trade details.`,
      [{ text: 'Great!', style: 'default' }]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this trade on Barterly!\n\n${bounty.title}\n\n${bounty.description}`,
        title: bounty.title,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleMarkComplete = async () => {
    Alert.alert(
      '✅ Mark as Complete?',
      'This will close the listing and mark the trade as completed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Complete',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'bounties', bounty.id), {
                status: 'COMPLETED',
              });
              Alert.alert(
                '✅ Trade Complete!',
                'Your listing has been marked as completed. Don\'t forget to review your trading partner!',
                [{ text: 'Done', onPress: () => navigation.goBack() }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Listing Detail</Text>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareBtn}
          >
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* HERO CARD */}
          <View style={styles.heroCard}>
            <View style={styles.heroBadgeRow}>
              <LinearGradient
                colors={typeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.typeBadge}
              >
                <Text style={styles.typeBadgeText}>{bounty.type}</Text>
              </LinearGradient>

              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: bounty.status === 'OPEN'
                    ? 'rgba(0,255,178,0.1)'
                    : 'rgba(255,255,255,0.05)',
                  borderColor: bounty.status === 'OPEN'
                    ? 'rgba(0,255,178,0.3)'
                    : 'rgba(255,255,255,0.1)',
                },
              ]}>
                <View style={[
                  styles.statusDot,
                  {
                    backgroundColor: bounty.status === 'OPEN'
                      ? '#00FFB2' : '#555',
                  },
                ]} />
                <Text style={[
                  styles.statusText,
                  {
                    color: bounty.status === 'OPEN'
                      ? '#00FFB2' : '#555',
                  },
                ]}>
                  {bounty.status}
                </Text>
              </View>

              {isOwner && (
                <View style={styles.ownerBadge}>
                  <Text style={styles.ownerBadgeText}>YOUR LISTING</Text>
                </View>
              )}
            </View>

            <Text style={styles.bountyTitle}>{bounty.title}</Text>
            <Text style={styles.bountyCategory}>{bounty.category}</Text>
            <Text style={styles.bountyDesc}>{bounty.description}</Text>

            {/* WANTS */}
            {bounty.wantedItem && (
              <View style={styles.wantsBox}>
                <Text style={styles.wantsBoxLabel}>Looking for</Text>
                <View style={styles.wantsBoxRow}>
                  <Text style={styles.wantsArrow}>→</Text>
                  <Text style={styles.wantsBoxValue}>
                    {bounty.wantedItem}
                  </Text>
                </View>
              </View>
            )}

            {/* CASH AMOUNT */}
            {bounty.cashAmount && bounty.cashAmount > 0 && (
              <View style={styles.cashBox}>
                <Text style={styles.cashLabel}>💵 Cash involved</Text>
                <Text style={styles.cashAmount}>
                  ${bounty.cashAmount.toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* TRADE INFO CARD */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>TRADE DETAILS</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🔄</Text>
                <Text style={styles.infoLabel}>Exchange</Text>
                <Text style={styles.infoValue}>
                  {EXCHANGE_LABELS[bounty.exchangeType] || bounty.exchangeType || 'Trade'}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📦</Text>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>
                  {bounty.classification}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{bounty.zipCode}</Text>
              </View>
            </View>
          </View>

          {/* TRADER CARD */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>POSTED BY</Text>
            <View style={styles.traderRow}>
              <LinearGradient
                colors={typeGradient}
                style={styles.traderAvatar}
              >
                <Text style={styles.traderAvatarText}>
                  {bounty.creatorDisplayName?.[0]?.toUpperCase() || '?'}
                </Text>
              </LinearGradient>
              <View style={styles.traderInfo}>
                <Text style={styles.traderName}>
                  {bounty.creatorDisplayName}
                </Text>
                <Text style={styles.traderLocation}>
                  📍 {bounty.zipCode}
                </Text>
              </View>
              <View style={styles.traderTrust}>
                <Text style={[
                  styles.traderTrustLabel,
                  { color: trustColor },
                ]}>
                  {trustLabel}
                </Text>
                {(bounty.creatorTrustScore || 0) > 0 && (
                  <Text style={styles.traderTrustScore}>
                    Score: {bounty.creatorTrustScore}
                  </Text>
                )}
              </View>
            </View>

            {/* TRUST BAR */}
            <View style={styles.trustBarBg}>
              <LinearGradient
                colors={['#7C3AED', '#00FFB2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.trustBarFill,
                  {
                    width: `${Math.min(
                      bounty.creatorTrustScore || 0, 100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.trustBarLabel}>
              {bounty.creatorTrustScore === 0 || !bounty.creatorTrustScore
                ? 'New trader — no completed trades yet'
                : `Trust Score: ${bounty.creatorTrustScore}/100`}
            </Text>
          </View>

          {/* HOW TO TRADE CARD */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>HOW THIS TRADE WORKS</Text>
            {[
              {
                n: '01',
                title: 'Express Interest',
                desc: 'Tap the button below to notify the trader you\'re interested.',
              },
              {
                n: '02',
                title: 'Discuss & Agree',
                desc: 'The trader will reach out. Discuss details, negotiate terms, and agree on the exchange.',
              },
              {
                n: '03',
                title: 'Complete the Trade',
                desc: 'Exchange goods or services. Both parties confirm completion and leave honest reviews.',
              },
            ].map((step) => (
              <View key={step.n} style={styles.stepRow}>
                <LinearGradient
                  colors={['#7C3AED', '#FF2D78']}
                  style={styles.stepNum}
                >
                  <Text style={styles.stepNumText}>{step.n}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* OWNER ACTIONS */}
          {isOwner && bounty.status === 'OPEN' && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>MANAGE YOUR LISTING</Text>
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={handleMarkComplete}
              >
                <Text style={styles.completeBtnText}>
                  ✅ Mark as Completed
                </Text>
              </TouchableOpacity>
              <Text style={styles.completeBtnHint}>
                Mark as complete once the trade has been successfully made.
              </Text>
            </View>
          )}

          <View style={{ height: 120 }} />

        </ScrollView>

        {/* BOTTOM ACTION */}
        {!isOwner && bounty.status === 'OPEN' && (
          <View style={styles.bottomAction}>
            <TouchableOpacity
              style={styles.interestBtn}
              onPress={handleInterest}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#7C3AED', '#FF2D78']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.interestBtnGradient}
              >
                <Text style={styles.interestBtnText}>
                  🤝 I'm Interested — Let's Trade
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {bounty.status === 'COMPLETED' && (
          <View style={styles.bottomAction}>
            <View style={styles.completedBanner}>
              <Text style={styles.completedText}>
                ✅ This trade has been completed
              </Text>
            </View>
          </View>
        )}

        {isOwner && bounty.status === 'OPEN' && (
          <View style={styles.bottomAction}>
            <View style={styles.ownerBanner}>
              <Text style={styles.ownerBannerText}>
                📦 This is your listing — manage it above
              </Text>
            </View>
          </View>
        )}

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  errorBtn: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  errorBtnText: {
    color: '#A78BFA', fontSize: 15, fontWeight: '700',
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
    bottom: 200, left: -60,
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
  shareBtn: { width: 60, alignItems: 'flex-end' },
  shareText: {
    color: '#7C3AED', fontSize: 14, fontWeight: '600',
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // HERO CARD
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, padding: 20,
    marginTop: 16, marginBottom: 12,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8, marginBottom: 16,
    alignItems: 'center', flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11, fontWeight: '800',
    color: '#fff', letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.5,
  },
  ownerBadge: {
    backgroundColor: 'rgba(255,209,102,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.3)',
    borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  ownerBadgeText: {
    fontSize: 10, fontWeight: '800',
    color: '#FFD166', letterSpacing: 0.5,
  },
  bountyTitle: {
    fontSize: 24, fontWeight: '900',
    color: '#fff', letterSpacing: -0.5,
    marginBottom: 6, lineHeight: 30,
  },
  bountyCategory: {
    fontSize: 13, color: '#A78BFA',
    fontWeight: '600', marginBottom: 14,
  },
  bountyDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 24, fontWeight: '300',
    marginBottom: 16,
  },

  // WANTS BOX
  wantsBox: {
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    borderRadius: 12, padding: 14,
    marginBottom: 10,
  },
  wantsBoxLabel: {
    fontSize: 10, fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5, marginBottom: 6,
  },
  wantsBoxRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  wantsArrow: { color: '#7C3AED', fontSize: 16, fontWeight: '700' },
  wantsBoxValue: {
    fontSize: 15, color: '#fff',
    fontWeight: '600', flex: 1,
  },

  // CASH BOX
  cashBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(5,150,105,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.2)',
    borderRadius: 12, padding: 14,
  },
  cashLabel: {
    fontSize: 14, color: '#10B981', fontWeight: '600',
  },
  cashAmount: {
    fontSize: 18, fontWeight: '900',
    color: '#10B981', letterSpacing: -0.5,
  },

  // CARDS
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, padding: 20,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10, fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2, marginBottom: 16,
  },

  // INFO GRID
  infoGrid: {
    flexDirection: 'row', alignItems: 'center',
  },
  infoItem: {
    flex: 1, alignItems: 'center', gap: 4,
  },
  infoDivider: {
    width: 1, height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  infoIcon: { fontSize: 20 },
  infoLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 12, fontWeight: '700', color: '#fff',
    textAlign: 'center',
  },

  // TRADER
  traderRow: {
    flexDirection: 'row',
    alignItems: 'center', gap: 12,
    marginBottom: 16,
  },
  traderAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  traderAvatarText: {
    color: '#fff', fontSize: 18, fontWeight: '900',
  },
  traderInfo: { flex: 1 },
  traderName: {
    fontSize: 16, fontWeight: '800',
    color: '#fff', marginBottom: 4,
  },
  traderLocation: {
    fontSize: 12, color: 'rgba(255,255,255,0.35)',
  },
  traderTrust: { alignItems: 'flex-end' },
  traderTrustLabel: {
    fontSize: 12, fontWeight: '700',
  },
  traderTrustScore: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 2,
  },
  trustBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2, overflow: 'hidden',
    marginBottom: 6,
  },
  trustBarFill: { height: '100%', borderRadius: 2 },
  trustBarLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.25)',
    letterSpacing: 0.3,
  },

  // STEPS
  stepRow: {
    flexDirection: 'row', gap: 14,
    marginBottom: 16, alignItems: 'flex-start',
  },
  stepNum: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumText: {
    fontSize: 11, fontWeight: '900', color: '#fff',
  },
  stepTitle: {
    fontSize: 14, fontWeight: '800',
    color: '#fff', marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 19,
  },

  // OWNER ACTIONS
  completeBtn: {
    backgroundColor: 'rgba(0,255,178,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,178,0.2)',
    borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 8,
  },
  completeBtnText: {
    color: '#00FFB2', fontSize: 14, fontWeight: '700',
  },
  completeBtnHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center', lineHeight: 17,
  },

  // BOTTOM ACTIONS
  bottomAction: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36,
    backgroundColor: 'rgba(10,0,21,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  interestBtn: { borderRadius: 14, overflow: 'hidden' },
  interestBtnGradient: {
    padding: 18, alignItems: 'center', borderRadius: 14,
  },
  interestBtnText: {
    color: '#fff', fontSize: 16,
    fontWeight: '800', letterSpacing: 0.3,
  },
  completedBanner: {
    backgroundColor: 'rgba(0,255,178,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,178,0.2)',
    borderRadius: 14, padding: 16,
    alignItems: 'center',
  },
  completedText: {
    color: '#00FFB2', fontSize: 15, fontWeight: '700',
  },
  ownerBanner: {
    backgroundColor: 'rgba(255,209,102,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.15)',
    borderRadius: 14, padding: 16,
    alignItems: 'center',
  },
  ownerBannerText: {
    color: '#FFD166', fontSize: 14, fontWeight: '600',
  },
});