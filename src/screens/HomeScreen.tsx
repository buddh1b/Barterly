import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { Bounty } from '../types';
import { useNavigation } from '@react-navigation/native';

const CATEGORIES = ['ALL', 'ITEMS', 'SERVICES', 'REQUESTS'];

const CATEGORY_ICONS: Record<string, string> = {
  'Education & Wellness': '📚',
  'Hands-On': '🔨',
  'Professional': '💼',
  'Simple Favors': '🤝',
  'Tools & Gear': '🛠️',
  'Yard Work': '🌿',
  'Plumbing': '🔧',
  'Pet Care': '🐾',
  'Cleaning': '🧹',
  'Moving': '📦',
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, 'bounties'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bounty[];
      setBounties(data);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, []);

  const filteredBounties = bounties.filter(b => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'ITEMS') return b.classification === 'ITEM';
    if (activeFilter === 'SERVICES') return b.classification === 'SERVICE';
    if (activeFilter === 'REQUESTS') return b.type === 'REQUEST';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category] || '⚡';
  };

  const getTypeColor = (type: string) => {
    return type === 'OFFER' ? '#6AAF45' : '#F5A623';
  };

  const renderBounty = ({ item }: { item: Bounty }) => (
    <TouchableOpacity
      style={styles.bountyCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('BountyDetail', { bounty: item })}
    >
      <View style={styles.bountyCardTop}>
        <View style={styles.bountyIconBox}>
          <Text style={styles.bountyIconText}>
            {getCategoryIcon(item.category)}
          </Text>
        </View>
        <View style={styles.bountyTopRight}>
          <View style={[styles.typeTag, { backgroundColor: getTypeColor(item.type) + '22' }]}>
            <Text style={[styles.typeTagText, { color: getTypeColor(item.type) }]}>
              {item.type}
            </Text>
          </View>
          <Text style={styles.bountyCategory}>{item.category}</Text>
        </View>
      </View>

      <Text style={styles.bountyTitle}>{item.title}</Text>
      <Text style={styles.bountyDesc} numberOfLines={2}>{item.description}</Text>

      <View style={styles.bountyFooter}>
        <View style={styles.karmaRow}>
          <Text style={styles.karmaCoin}>🪙</Text>
          <Text style={styles.karmaText}>{item.creatorKarma} Karma</Text>
        </View>
        <View style={styles.creatorRow}>
          <View style={styles.creatorAvatar}>
            <Text style={styles.creatorAvatarText}>
              {item.creatorDisplayName?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.creatorName}>{item.creatorDisplayName}</Text>
        </View>
      </View>

      <View style={styles.bountyCardFooter}>
        <Text style={styles.zipCode}>📍 {item.zipCode}</Text>
        <View style={[styles.statusDot, {
          backgroundColor: item.status === 'OPEN' ? '#6AAF45' : '#999'
        }]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>
            Hey {user?.displayName?.split(' ')[0] || 'Neighbor'} 👋
          </Text>
          <Text style={styles.headerTitle}>The Village</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.postBtn}
            onPress={() => navigation.navigate('PostBounty')}
          >
            <Text style={styles.postBtnText}>+ Post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileBtnText}>
              {user?.displayName?.[0]?.toUpperCase() || '?'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterTab, activeFilter === cat && styles.filterTabActive]}
            onPress={() => setActiveFilter(cat)}
          >
            <Text style={[styles.filterTabText, activeFilter === cat && styles.filterTabTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOUNTY LIST */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6AAF45" />
          <Text style={styles.loadingText}>Loading the village...</Text>
        </View>
      ) : filteredBounties.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🏡</Text>
          <Text style={styles.emptyTitle}>No bounties yet!</Text>
          <Text style={styles.emptySub}>Be the first neighbor to post one.</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate('PostBounty')}
          >
            <Text style={styles.emptyBtnText}>Post a Bounty →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBounties}
          renderItem={renderBounty}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => setRefreshing(true)}
              tintColor="#6AAF45"
            />
          }
        />
      )}

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏡</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Village</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('PostBounty')}
        >
          <View style={styles.navPostBtn}>
            <Text style={styles.navPostBtnText}>+</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>My Porch</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  headerGreeting: { fontSize: 13, color: '#999', fontWeight: '500' },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    fontStyle: 'italic',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postBtn: {
    backgroundColor: '#6AAF45',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // FILTERS
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  filterTabActive: {
    backgroundColor: '#6AAF45',
    borderColor: '#6AAF45',
  },
  filterTabText: { fontSize: 12, fontWeight: '600', color: '#999' },
  filterTabTextActive: { color: '#fff' },

  // LIST
  list: { padding: 16, gap: 12 },

  // BOUNTY CARD
  bountyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bountyCardTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bountyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bountyIconText: { fontSize: 24 },
  bountyTopRight: { flex: 1, justifyContent: 'center', gap: 4 },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeTagText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  bountyCategory: { fontSize: 12, color: '#999', fontWeight: '500' },
  bountyTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1A1A1A',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  bountyDesc: { fontSize: 13, color: '#777', lineHeight: 19, marginBottom: 12 },

  bountyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  karmaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  karmaCoin: { fontSize: 18 },
  karmaText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  creatorName: { fontSize: 12, color: '#999', fontWeight: '500' },

  bountyCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  zipCode: { fontSize: 11, color: '#BBB' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  // LOADING
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { color: '#999', fontSize: 14 },

  // EMPTY
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  emptySub: { fontSize: 15, color: '#999', textAlign: 'center', marginBottom: 24 },
  emptyBtn: {
    backgroundColor: '#6AAF45',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // BOTTOM NAV
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingBottom: 20,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, color: '#999', fontWeight: '600' },
  navLabelActive: { color: '#6AAF45' },
  navPostBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6AAF45',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#6AAF45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  navPostBtnText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});