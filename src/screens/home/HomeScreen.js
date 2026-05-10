import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
  RefreshControl, ScrollView, Image, Modal
} from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { getShops } from '../../api/shops';
import { useAuth } from '../../context/AuthContext';
import { getActiveAd, getAllActiveAds } from '../../api/ads';

const COLORS = [
  '#4f46e5', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#7c3aed',
  '#0284c7', '#16a34a', '#c2410c',
];

const GENDERS = [
  { key: '', label: 'All' },
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
  { key: 'kids', label: 'Kids' },
];

const TYPES = [
  { key: 'clothes', label: 'Clothes' },
  { key: 'shoes', label: 'Shoes' },
];

export default function HomeScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeGender, setActiveGender] = useState('');
  const [activeType, setActiveType] = useState('');
  const [activeAd, setActiveAd] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const adScrollRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchShops();
    fetchAds();
    fetchActiveAd();
  }, []);

  // Auto scroll banner ads every 5 seconds
  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex(prev => {
          const next = (prev + 1) % ads.length;
          adScrollRef.current?.scrollTo({
            x: next * 320,
            animated: true
          });
          return next;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  const fetchShops = async () => {
    try {
      const res = await getShops();
      setShops(res.data);
    } catch {
      console.log('Failed to load shops');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await getAllActiveAds();
      if (res.data && res.data.length > 0) {
        setAds(res.data);
      }
    } catch {
      console.log('No banner ads');
    }
  };

  const fetchActiveAd = async () => {
    try {
      const res = await getActiveAd();
      if (res.data && res.data.image_url) {
        setActiveAd(res.data);
        setTimeout(() => setShowAd(true), 1000);
      }
    } catch {
      console.log('No active ad');
    }
  };

  const handleAdPress = () => {
    setShowAd(false);
    setTimeout(() => {
      navigation.navigate('ShopDetail', {
        shopId: activeAd.shop?.id,
        shopName: activeAd.shop?.name
      });
    }, 300);
  };

  const filtered = shops.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    let matchCategory = true;
    if (activeGender && activeType) {
      matchCategory = s.category === `${activeGender}_${activeType}`;
    } else if (activeGender) {
      matchCategory =
        s.category === `${activeGender}_clothes` ||
        s.category === `${activeGender}_shoes`;
    }
    return matchSearch && matchCategory;
  });

  const renderShop = ({ item, index }) => {
    const color = COLORS[index % COLORS.length];
    const initial = item.name[0].toUpperCase();
    const logoUrl = item.logo_url || null;

    return (
      <TouchableOpacity
        style={styles.shopCard}
        onPress={() => navigation.navigate('ShopDetail', {
          shopId: item.id,
          shopName: item.name
        })}
        activeOpacity={0.7}
      >
        <View style={[styles.shopImageBox, { backgroundColor: color }]}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.shopLogo}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.shopInitial}>{initial}</Text>
          )}
        </View>
        <View style={styles.shopBody}>
          <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.shopCity} numberOfLines={1}>{item.city}</Text>
          <Text style={styles.shopCount}>{item.product_count} items</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* Popup Ad Modal */}
      <Modal
        visible={showAd}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAd(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.adCard}>
            <TouchableOpacity
              style={styles.adCloseBtn}
              onPress={() => setShowAd(false)}
            >
              <Text style={styles.adCloseText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAdPress} activeOpacity={0.9}>
              <Image
                source={{ uri: activeAd?.image_url }}
                style={styles.adImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={styles.adFooter}>
              <View>
                <Text style={styles.adShopName}>{activeAd?.shop?.name}</Text>
                <Text style={styles.adShopCity}>{activeAd?.shop?.city}</Text>
              </View>
              <TouchableOpacity style={styles.visitBtn} onPress={handleAdPress}>
                <Text style={styles.visitBtnText}>Visit Shop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchShops();
              fetchAds();
            }}
          />
        }
      >
        {/* Header — Search Products button only */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.searchProductsBtn}
            onPress={() => navigation.navigate('Products', { gender: '' })}
            activeOpacity={0.8}
          >
            <Text style={styles.searchProductsIcon}>🔍</Text>
            <Text style={styles.searchProductsText}>Search products</Text>
            <Text style={styles.searchProductsArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Banner Ads */}
        {ads.length > 0 && (
          <View style={styles.bannerSection}>
            <ScrollView
              ref={adScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              contentContainerStyle={styles.bannerRow}
              onMomentumScrollEnd={e => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / 320
                );
                setCurrentAdIndex(index);
              }}
            >
              {ads.map((ad) => (
                <TouchableOpacity
                  key={ad.id}
                  style={styles.bannerCard}
                  onPress={() => navigation.navigate('ShopDetail', {
                    shopId: ad.shop?.id,
                    shopName: ad.shop?.name
                  })}
                  activeOpacity={0.85}
                >
                  {ad.image_url ? (
                    <Image
                      source={{ uri: ad.image_url }}
                      style={styles.bannerImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.bannerImage, {
                      backgroundColor: '#4f46e5',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }]}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                        {ad.shop?.name}
                      </Text>
                    </View>
                  )}
                  <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerShopName}>{ad.shop?.name}</Text>
                    <Text style={styles.bannerShopCity}>{ad.shop?.city}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {ads.length > 1 && (
              <View style={styles.dotsRow}>
                {ads.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, currentAdIndex === i && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Gender filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {GENDERS.map(g => (
            <TouchableOpacity
              key={g.key}
              style={[
                styles.catBtn,
                activeGender === g.key && styles.catBtnActive
              ]}
              onPress={() => {
                setActiveGender(g.key);
                setActiveType('');
              }}
            >
              <Text style={[
                styles.catText,
                activeGender === g.key && styles.catTextActive
              ]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Type sub-filter */}
        {activeGender !== '' && (
          <View style={styles.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.typeBtn,
                  activeType === t.key && styles.typeBtnActive
                ]}
                onPress={() =>
                  setActiveType(prev => prev === t.key ? '' : t.key)
                }
              >
                <Text style={[
                  styles.typeText,
                  activeType === t.key && styles.typeTextActive
                ]}>
                  {activeGender.charAt(0).toUpperCase() + activeGender.slice(1)} {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Local shops title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Local shops</Text>
          <Text style={styles.sectionCount}>{filtered.length} shops</Text>
        </View>

        {/* Shop search — below Local shops */}
        <View style={styles.shopSearchBox}>
          <Text style={styles.shopSearchIcon}>🏪</Text>
          <TextInput
            style={styles.shopSearchInput}
            placeholder="Search shops by name or city..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.shopSearchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shop grid */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyText}>No shops found</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id.toString()}
            numColumns={3}
            renderItem={renderShop}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            scrollEnabled={false}
          />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  // Loading
  centered: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 80, height: 80,
    backgroundColor: '#4f46e5',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  loadingLogoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  loadingT: {
    fontSize: 38, fontWeight: '900', color: '#fff', lineHeight: 42,
  },
  loadingK: {
    fontSize: 26, fontWeight: '700',
    color: 'rgba(255,255,255,0.65)', marginBottom: 4,
  },
  loadingName: {
    fontSize: 20, fontWeight: '700', color: '#4f46e5', letterSpacing: 1,
  },

  // Header
  header: {
    backgroundColor: '#4f46e5',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchProductsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchProductsIcon: { fontSize: 16 },
  searchProductsText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  searchProductsArrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 20,
  },

  // Banner ads
  bannerSection: { marginTop: 12 },
  bannerRow: { paddingHorizontal: 14, gap: 12 },
  bannerCard: {
    width: 340,
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerShopName: {
    color: '#fff', fontSize: 14, fontWeight: '700',
  },
  bannerShopCity: {
    color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db',
  },
  dotActive: { backgroundColor: '#4f46e5' },

  // Category filter
  catRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  catBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  catBtnActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  catText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  catTextActive: { color: '#fff' },

  // Type sub-filter
  typeRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 10,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#4f46e5',
  },
  typeText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  typeTextActive: { color: '#4f46e5' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  sectionCount: { fontSize: 12, color: '#9ca3af' },

  // Shop search
  shopSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  shopSearchIcon: { fontSize: 14 },
  shopSearchInput: {
    flex: 1, fontSize: 13, color: '#111827',
  },
  shopSearchClear: { color: '#9ca3af', fontSize: 14 },

  // Shop grid
  grid: { paddingHorizontal: 14 },
  gridRow: { justifyContent: 'space-between', marginBottom: 10 },
  shopCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 1,
  },
  shopImageBox: {
    height: 64, alignItems: 'center', justifyContent: 'center',
  },
  shopInitial: { fontSize: 24, fontWeight: '700', color: '#fff' },
  shopLogo: { width: '100%', height: 64, borderRadius: 0 },
  shopBody: { padding: 8 },
  shopName: { fontSize: 11, fontWeight: '600', color: '#111827' },
  shopCity: { fontSize: 10, color: '#9ca3af', marginTop: 1 },
  shopCount: { fontSize: 10, color: '#4f46e5', marginTop: 2, fontWeight: '500' },

  // Popup ad
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  adCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: 340,
  },
  adCloseBtn: {
    position: 'absolute',
    top: 10, right: 10, zIndex: 10,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  adCloseText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  adImage: { width: '100%', height: 320 },
  adFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  adShopName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  adShopCity: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  visitBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  visitBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: '#9ca3af', fontSize: 14 },
});