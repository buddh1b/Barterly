import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
  RefreshControl, Dimensions, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { Bounty, getTrustLabel, getTrustColor } from '../types';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FILTERS = ['ALL', 'OFFER', 'REQUEST', 'ITEM', 'SERVICE'];

const CATEGORY_ICONS: Record<string, string> = {
  'Education & Wellness': '📚',
  'Hands-On': '🔨',
  'Professional': '💼',
  'Simple Favors': '🤝',
  'Tools & Gear': '🛠️',
  'Technology': '💻',
  'Design & Creative': '🎨',
  'Food & Cooking': '🍳',
  'Outdoor & Garden': '🌿',
  'Automotive': '🚗',
};

const TYPE_GRADIENTS: Record<string, [string, string]> = {
  OFFER: ['#7C3AED', '#A855F7'],
  REQUEST: ['#FF2D78', '#FF6B9D'],
  ITEM: ['#00D4FF', '#0EA5E9'],
  SERVICE: ['#00FFB2', '#10B981'],
  TRADE: ['#7C3AED', '#A855F7'],
  CASH: ['#059669', '#10B981'],
  HYBRID: ['#D97706', '#F59E0B'],
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, 'bounties'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Bounty[];
      setBounties(data);
      setLoading(false);
      setRefreshing(false);
    });
    return unsubscribe;
  }, []);

  const filtered = bounties.filter(b => {
    const matchesFilter =
      activeFilter === 'ALL' ||
      b.type === activeFilter ||
      b.classification === activeFilter;
    const matchesSearch =
      !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (category: string) =>
    CATEGORY_ICONS[category] || '⚡';

  const renderBounty = ({ item }: { item: Bounty }) => {
    const trustColor = getTrustColor(item.creatorTrustScore || 0);
    const trustLabel = getTrustLabel(item.creatorTrustScore || 0);
    const typeGradient = TYPE_GRADIENTS[item.type] || ['#7C3AED', '#FF2D78'];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('BountyDetail', { bounty: item })}
      >
        {/* STATUS DOT */}
        <View style={[
          styles.statusDot,
          { backgroundColor: item.status === 'OPEN' ? '#00FFB2' : '#555' }
        ]} />

        {/* TOP ROW */}
        <View style={styles.cardTop}>
          <View style={styles.cardEmoji}>
            <Text style={{ fontSize: 22 }}>
              {getIcon(item.category)}
            </Text>
          </View>
          <View style={styles.cardTopRight}>
            <LinearGradient
              colors={typeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.typeTag}
            >
              <Text style={styles.typeTagText}>{item.type}</Text>
            </LinearGradient>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* DESCRIPTION */}
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        {/* WANTS ROW */}
        {item.wantedItem ? (
          <View style={styles.wantsRow}>
            <Text style={styles.wantsLabel}>Wants </Text>
            <Text style={styles.wantsArrow}>→ </Text>
            <Text style={styles.wantsValue} numberOfLines={1}>
              {item.wantedItem}
            </Text>
          </View>
        ) : (
          <View style={styles.wantsRow}>
            <Text style={styles.wantsLabel}>Exchange </Text>
            <Text style={styles.wantsArrow}>→ </Text>
            <Text style={styles.wantsValue}>
              {item.exchangeType || item.classification}
            </Text>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.cardFooter}>
          <View style={styles.creatorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.creatorDisplayName?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.creatorName}>
                {item.creatorDisplayName}
              </Text>
              <Text style={styles.location}>📍 {item.zipCode}</Text>
            </View>
          </View>
          <View style={styles.trustBox}>
            <Text style={[styles.trustLabel, { color: trustColor }]}>
              {trustLabel}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const displayName = user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] || 'Trader';

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
          <View>
            <Text style={styles.greeting}>
              Hey {displayName} 👋
            </Text>
            <Text style={styles.headerTitle}>The Market</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.postBtn}
              onPress={() => navigation.navigate('PostBounty')}
            >
              <LinearGradient
                colors={['#7C3AED', '#FF2D78']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.postBtnGradient}
              >
                <Text style={styles.postBtnText}>+ Post</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileBtnText}>
                {displayName[0]?.toUpperCase() || '?'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search trades, skills, goods..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* FILTER CHIPS */}
        <View style={styles.filtersWrapper}>
          <FlatList
            horizontal
            data={FILTERS}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setActiveFilter(item)}
                style={[
                  styles.filterChip,
                  activeFilter === item && styles.filterChipActive,
                ]}
              >
                {activeFilter === item ? (
                  <LinearGradient
                    colors={['#7C3AED', '#FF2D78']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.filterChipGradient}
                  >
                    <Text style={styles.filterChipTextActive}>{item}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.filterChipText}>{item}</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>

        {/* RESULTS COUNT */}
        {!loading && (
          <View style={styles.resultsRow}>
            <Text style={styles.resultsCount}>
              {filtered.length} listing{filtered.length !== 1 ? 's' : ''}
              {search ? ` for "${search}"` : ''}
            </Text>
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearAll}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* CONTENT */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Loading listings...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🔍</Text>
            <Text style={styles.emptyTitle}>
              {search ? 'No results found' : 'No listings yet!'}
            </Text>
            <Text style={styles.emptySub}>
              {search
                ? `No listings match "${search}". Try a different search.`
                : 'Be the first to post a listing.'}
            </Text>
            {!search && (
              <TouchableOpacity
                onPress={() => navigation.navigate('PostBounty')}
              >
                <LinearGradient
                  colors={['#7C3AED', '#FF2D78']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyBtn}
                >
                  <Text style={styles.emptyBtnText}>Post First Listing →</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderBounty}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => setRefreshing(true)}
                tintColor="#7C3AED"
              />
            }
          />
        )}

        {/* BOTTOM NAV */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🏪</Text>
            <Text style={[styles.navLabel, styles.navLabelActive]}>
              Market
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('PostBounty')}
          >
            <LinearGradient
              colors={['#7C3AED', '#FF2D78']}
              style={styles.navPostBtn}
            >
              <Text style={styles.navPostBtnText}>+</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  orb: { position: 'absolute', borderRadius: 9999 },
  orb1: {
    width: 300, height: 300,
    backgroundColor: '#7C3AED', opacity: 0.08,
    top: -100, right: -80,
  },
  orb2: {
    width: 200, height: 200,
    backgroundColor: '#FF2D78', opacity: 0.05,
    bottom: 100, left: -60,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  greeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500', marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24, fontWeight: '900',
    color: '#fff', letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center', gap: 10,
  },
  postBtn: { borderRadius: 20, overflow: 'hidden' },
  postBtnGradient: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnText: {
    color: '#fff', fontWeight: '700', fontSize: 13,
  },
  profileBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderWidth: 1, borderColor: '#7C3AED',
    alignItems: 'center', justifyContent: 'center',
  },
  profileBtnText: {
    color: '#A78BFA', fontWeight: '800', fontSize: 14,
  },

  // SEARCH
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20, marginVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14, gap: 10,
  },
  searchIcon: { fontSize: 16, opacity: 0.5 },
  searchInput: {
    flex: 1, paddingVertical: 12,
    fontSize: 14, color: '#fff',
  },
  clearSearch: {
    color: 'rgba(255,255,255,0.3)', fontSize: 16,
  },

  // FILTERS
  filtersWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    marginBottom: 4,
  },
  filtersList: {
    paddingHorizontal: 20,
    paddingBottom: 12, gap: 8,
  },
  filterChip: {
    borderRadius: 20, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: { borderColor: 'transparent' },
  filterChipGradient: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20,
  },
  filterChipText: {
    paddingHorizontal: 16, paddingVertical: 7,
    fontSize: 12, fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  filterChipTextActive: {
    fontSize: 12, fontWeight: '700', color: '#fff',
  },

  // RESULTS
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500',
  },
  clearAll: {
    fontSize: 12, color: '#7C3AED', fontWeight: '600',
  },

  // LIST
  list: { padding: 16, gap: 12, paddingBottom: 90 },

  // CARD
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  statusDot: {
    position: 'absolute',
    top: 16, right: 16,
    width: 8, height: 8, borderRadius: 4,
  },
  cardTop: {
    flexDirection: 'row', gap: 12,
    marginBottom: 12,
  },
  cardEmoji: {
    width: 46, height: 46,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTopRight: {
    flex: 1, justifyContent: 'center', gap: 4,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 10, fontWeight: '800',
    color: '#fff', letterSpacing: 0.5,
  },
  categoryText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 16, fontWeight: '800',
    color: '#fff', letterSpacing: -0.3,
    marginBottom: 6, lineHeight: 22,
  },
  cardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 19, marginBottom: 12,
  },
  wantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 10, borderRadius: 10,
    marginBottom: 12,
  },
  wantsLabel: {
    fontSize: 12, color: 'rgba(255,255,255,0.35)',
  },
  wantsArrow: { fontSize: 12, color: '#7C3AED' },
  wantsValue: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500', flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center', gap: 8,
  },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(124,58,237,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    color: '#A78BFA', fontSize: 12, fontWeight: '800',
  },
  creatorName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  location: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
  },
  trustBox: { alignItems: 'flex-end' },
  trustLabel: {
    fontSize: 11, fontWeight: '700',
  },

  // LOADING
  loadingBox: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', gap: 12,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.3)', fontSize: 14,
  },

  // EMPTY
  emptyBox: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 32,
  },
  emptyTitle: {
    fontSize: 22, fontWeight: '900',
    color: '#fff', marginBottom: 8,
    letterSpacing: -0.5, textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center', marginBottom: 24,
    lineHeight: 21,
  },
  emptyBtn: {
    paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#fff', fontWeight: '700', fontSize: 15,
  },

  // BOTTOM NAV
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,0,21,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 20, paddingTop: 10,
  },
  navItem: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', gap: 4,
  },
  navIcon: { fontSize: 22 },
  navLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '600',
  },
  navLabelActive: { color: '#7C3AED' },
  navPostBtn: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -20,
  },
  navPostBtnText: {
    color: '#fff', fontSize: 28,
    fontWeight: '300', marginTop: -2,
  },
});