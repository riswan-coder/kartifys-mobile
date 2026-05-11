import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, TextInput
} from 'react-native';
import { useEffect, useState } from 'react';
import { getShopDetail } from '../../api/shops';
import { getProducts } from '../../api/products';

export default function ShopDetailScreen({ route, navigation }) {
  const { shopId, shopName } = route.params;
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shopRes, productsRes] = await Promise.all([
        getShopDetail(shopId),
        getProducts({ shop: shopId })
      ]);
      setShop(shopRes.data);
      setProducts(productsRes.data);
    } catch {
      console.log('Failed to load shop');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => {
    if (!search) return true;
    const words = search.toLowerCase().split(' ').filter(w => w.length > 0);
    return words.every(word =>
      p.name?.toLowerCase().includes(word) ||
      p.description?.toLowerCase().includes(word) ||
      p.colors?.toLowerCase().includes(word) ||
      p.sizes?.toLowerCase().includes(word) ||
      p.category?.gender?.toLowerCase().includes(word) ||
      p.category?.product_type?.toLowerCase().includes(word)
    );
  });

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.is_primary && img.image);
      const anyImage = product.images.find(img => img.image);
      const url = primary?.image || anyImage?.image || null;
      if (url && url.startsWith('http')) return url;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.shopIconBig}>
          {shop?.logo_url ? (
            <Image
              source={{ uri: shop.logo_url }}
              style={styles.shopLogo}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.shopIconText}>
              {shopName[0].toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={styles.shopName}>{shop?.name}</Text>
        <Text style={styles.shopCity}>{shop?.city} · {shop?.phone}</Text>
        {shop?.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {shop.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </View>
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Products count */}
      <Text style={styles.productCount}>
        {filtered.length} products
      </Text>

      {/* Products grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {search ? 'No products match your search' : 'No products yet'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const imageUrl = getProductImage(item);
          return (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', {
                productId: item.id
              })}
              activeOpacity={0.7}
            >
              <View style={styles.productImage}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.realImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.productEmoji}>
                    {item.category?.product_type === 'shoes' ? '👟' : '👕'}
                  </Text>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>₹{item.price}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  loadingContainer: {
  flex: 1,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
  },
  loadingLogo: {
    width: 80,
    height: 80,
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
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 42,
  },
  loadingK: {
    fontSize: 26,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
  },
  loadingAppName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4f46e5',
    letterSpacing: 1,
  },

  header: {
    backgroundColor: '#4f46e5',
    padding: 16,
    paddingTop: 50,
    alignItems: 'center',
    paddingBottom: 16,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 10 },
  backText: { color: '#c7d2fe', fontSize: 16 },
  shopIconBig: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, overflow: 'hidden',
  },
  shopLogo: { width: 56, height: 56, borderRadius: 16 },
  shopIconText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  shopName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  shopCity: { fontSize: 12, color: '#c7d2fe', marginTop: 3 },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
  },
  categoryText: { color: '#fff', fontSize: 11, fontWeight: '500' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  clearText: { color: '#9ca3af', fontSize: 14 },
  productCount: {
    fontSize: 12,
    color: '#9ca3af',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  grid: { paddingHorizontal: 12, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 1,
  },
  productImage: {
    height: 120,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  realImage: { width: '100%', height: 120 },
  productEmoji: { fontSize: 40 },
  productInfo: { padding: 10 },
  productName: {
    fontSize: 13, fontWeight: '600',
    color: '#111827', marginBottom: 4,
  },
  productPrice: {
    fontSize: 15, fontWeight: '700', color: '#4f46e5',
  },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 14 },
});