import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Dimensions, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bounty } from '../types';

const { width } = Dimensions.get('window');

const TYPE_COLORS: Record<string, [string, string]> = {
  OFFER: ['#7C3AED', '#A855F7'],
  REQUEST: ['#FF2D78', '#FF6B9D'],
  ITEM: ['#00D4FF', '#0EA5E9'],
  SERVICE: ['#00FFB2', '#10B981'],
};

const EXCHANGE_ICONS: Record<string, string> = {
  TRADE: '🔄',
  CASH: '💵',
  HYBRID: '⚖️',
  SERVICE: '🛠️',
};

export default function BountyDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const bounty: Bounty = route.params?.bounty;
  const user = auth.currentUser;
  const isOwner = user?.uid === bounty?.creatorId;

  if (!bounty) {
    return (
      <LinearGradient
        colors={['#0A0015', '#0D0A2E', '#0A1628']}
        style={styles.container}
      >
        <SafeAreaView style={styles.center}>
          <Text style={styles.errorText}>Bounty not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const handleInterest = () => {
    if (isOwner) {
      Alert.alert(
        'Your Listing',
        'This is your own bounty. You cannot express interest in your own listing.'
      );
      return;
    }
    Alert.alert(
      '🤝 Interested!',
      `We'll notify ${bounty.creatorDisplayName} that you're interested. They'll reach out to negotiate the trade.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this trade on Barterly: ${bounty.title} — ${bounty.description}`,
        title: bounty.title,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleCloseBounty = async () => {
    Alert.alert(
      'Close Bounty',
      'Mark this bounty as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Complete',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'bounties', bounty.id), {
                status: 'COMPLETED',
              });
              Alert.alert('✅ Done!', 'Your bounty has been marked as completed.');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const typeColors = TYPE_COLORS[bounty.type] || ['#7C3AED', '#FF2D78'];

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
          <Text style={styles.headerTitle}>Bounty Detail</Text>
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
            {/* TYPE BADGE */}
            <View style={styles.heroBadgeRow}>
              <LinearGradient
                colors={typeColors}
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
                }
              ]}>
                <View style={[
                  styles.statusDot,
                  {
                    backgroundColor: bounty.status === 'OPEN'
                      ? '#00FFB2'
                      : '#666'
                  }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: bounty.status === 'OPEN' ? '#00FFB2' : '#666' }
                ]}>
                  {bounty.status}
                </Text>
              </View>
            </View>

            {/* TITLE */}
            <Text style={styles.bountyTitle}>{bounty.title}</Text>

            {/* CATEGORY */}
            <Text style={styles.bountyCategory}>{bounty.category}</Text>

            {/* DESCRIPTION */}
            <Text style={styles.bountyDesc}>{bounty.description}</Text>
          </View>

          {/* EXCHANGE INFO CARD */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>EXCHANGE DETAILS</Text>
            <View style={styles.exchangeRow}>
              <View style={styles.exchangeItem}>
                <Text style={styles.exchangeIcon}>
                  {EXCHANGE_ICONS[bounty.classification] || '🔄'}
                </Text>
                <Text style={styles.exchangeItemLabel}>Type</Text>
                <Text style={styles.exchangeItemValue}>
                  {bounty.classification}
                </Text>
              </View>
              <View style={styles.exchangeDivider} />
              <View style={styles.exchangeItem}>
                <Text style={styles.exchangeIcon}>📍</Text>
                <Text style={styles.exchangeItemLabel}>Location</Text>
                <Text style={styles.exchangeItemValue}>{bounty.zipCode}</Text>
              </View>
              <View style={styles.exchangeDivider} />
              <View style={styles.exchangeItem}>
                <Text style={styles.exchangeIcon}>⚡</Text>
                <Text style={styles.exchangeItemLabel}>Status</Text>
                <Text style={styles.exchangeItemValue}>{bounty.status}</Text>
              </View>
            </View>
          </View>

          {/* CREATOR CARD */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>POSTED BY</Text>
            <View style={styles.creatorRow}>
              <LinearGradient
                colors={typeColors}
                style={styles.creatorAvatar}
              >
                <Text style={styles.creatorAvatarText}>
                  {bounty.creatorDisplayName?.[0]?.toUpperCase() || '?'}
                </Text>
              </LinearGradient>
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>
                  {bounty.creatorDisplayName}
                </Text>
                <Text style={styles.creatorLocation}>
                  📍 {bounty.zipCode}
                </Text>
              </View>
              <View style={styles.trustBox}>
                <Text style={styles.trustNumber}>
                  ✦ {bounty.creatorKarma}
                </Text>
                <Text style={styles.trustLabel}>Trust Score</Text>
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
                  { width: `${Math.min(bounty.creatorKarma, 100)}%` }
                ]}
              />
            </View>
            <Text style={styles.trustBarLabel}>
              Trust Score: {bounty.creatorKarma}/100
            </Text>
          </View>

          {/* HOW IT WORKS */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>HOW THIS TRADE WORKS</Text>
            {[
              { n: '01', t: 'Express Interest', d: 'Tap the button below to let the trader know you\'re interested.' },
              { n: '02', t: 'Negotiate', d: 'The trader will reach out to discuss the details and finalize the trade.' },
              { n: '03', t: 'Complete & Rate', d: 'Meet up or ship. Both confirm completion. Your Trust Scores update.' },
            ].map((step) => (
              <View key={step.n} style={styles.stepRow}>
                <LinearGradient
                  colors={['#7C3AED', '#FF2D78']}
                  style={styles.stepNumber}
                >
                  <Text style={styles.stepNumberText}>{step.n}</Text>
                </LinearGradient>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.t}</Text>
                  <Text style={styles.stepDesc}>{step.d}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* OWNER ACTIONS */}
          {isOwner && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>MANAGE YOUR BOUNTY</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleCloseBounty}
              >
                <Text style={styles.closeBtnText}>✅ Mark as Completed</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* SPACER */}
          <View style={{ height: 100 }} />

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

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  backLink: { color: '#7C3AED', fontSize: 15, fontWeight: '700' },

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
  shareBtn: { width: 60, alignItems: 'flex-end' },
  shareText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // HERO CARD
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bountyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 6,
    lineHeight: 30,
  },
  bountyCategory: {
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '600',
    marginBottom: 16,
  },
  bountyDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 24,
    fontWeight: '300',
  },

  // CARDS
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
    marginBottom: 16,
  },

  // EXCHANGE ROW
  exchangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exchangeItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  exchangeDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  exchangeIcon: { fontSize: 20 },
  exchangeItemLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  exchangeItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // CREATOR
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  creatorInfo: { flex: 1 },
  creatorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  creatorLocation: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  trustBox: { alignItems: 'flex-end' },
  trustNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00FFB2',
  },
  trustLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  trustBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  trustBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  trustBarLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 0.3,
  },

  // STEPS
  stepRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
  },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 19,
  },

  // OWNER ACTIONS
  closeBtn: {
    backgroundColor: 'rgba(0,255,178,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,178,0.2)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#00FFB2',
    fontSize: 14,
    fontWeight: '700',
  },

  // BOTTOM ACTION
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: 'rgba(10,0,21,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  interestBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  interestBtnGradient: {
    padding: 18,
    alignItems: 'center',
    borderRadius: 14,
  },
  interestBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  completedBanner: {
    backgroundColor: 'rgba(0,255,178,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,178,0.2)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  completedText: {
    color: '#00FFB2',
    fontSize: 15,
    fontWeight: '700',
  },
});