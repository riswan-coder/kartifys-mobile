import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Image
} from 'react-native';
import { useEffect, useState } from 'react';
import { getProducts } from '../../api/products';

export default function ProductsScreen({ route, navigation }) {
  const { gender, type } = route.params || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeGender, setActiveGender] = useState(gender || '');
  const [activeType, setActiveType] = useState(type || '');

  useEffect(() => {
    fetchProducts();
  }, [activeGender, activeType]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeGender) params.gender = activeGender;
      if (activeType) params.type = activeType;
      if (search.trim()) params.search = search.trim();
      const res = await getProducts(params);
      setProducts(res.data);
    } catch {
      console.log('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const genders = [
    { key: '', label: 'All' },
    { key: 'men', label: 'Men' },
    { key: 'women', label: 'Women' },
    { key: 'kids', label: 'Kids' },
  ];

  const types = [
    { key: '', label: 'All' },
    { key: 'clothes', label: 'Clothes' },
    { key: 'shoes', label: 'Shoes' },
  ];

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find(img => img.is_primary && img.image);
      const any = product.images.find(img => img.image);
      const url = primary?.image || any?.image || null;
      if (url && url.startsWith('http')) return url;
    }
    return null;
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search Products</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, color, size..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          autoFocus
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search hint */}
      {search.length === 0 && (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>
            Try: "blue shirt", "linen", "size 10", "white shoes"
          </Text>
        </View>
      )}

      {/* Gender filter */}
      <View style={styles.filterRow}>
        {genders.map(g => (
          <TouchableOpacity
            key={g.key}
            style={[styles.filterBtn, activeGender === g.key && styles.filterBtnActive]}
            onPress={() => setActiveGender(g.key)}
          >
            <Text style={[styles.filterText, activeGender === g.key && styles.filterTextActive]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Type filter */}
      <View style={styles.filterRow}>
        {types.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.filterBtn, activeType === t.key && styles.filterBtnActive]}
            onPress={() => setActiveType(t.key)}
          >
            <Text style={[styles.filterText, activeType === t.key && styles.filterTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results count */}
      {!loading && (
        <Text style={styles.resultCount}>
          {products.length} products found
          {search ? ` for "${search}"` : ''}
        </Text>
      )}

      {/* Products */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                {search
                  ? `No products found for "${search}"`
                  : 'No products available'
                }
              </Text>
              {search.length > 0 && (
                <Text style={styles.emptySub}>
                  Try searching by color, size or product type
                </Text>
              )}
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
                  <Text style={styles.productShop} numberOfLines={1}>
                    {item.shop_name}
                  </Text>
                  {item.colors ? (
                    <Text style={styles.productColors} numberOfLines={1}>
                      {item.colors}
                    </Text>
                  ) : null}
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#4f46e5',
    padding: 16,
    paddingTop: 54,
    paddingBottom: 14,
  },
  backText: { color: '#c7d2fe', fontSize: 16, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#4f46e5',
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  clearText: { color: '#9ca3af', fontSize: 16 },
  hintBox: {
    marginHorizontal: 14,
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
  },
  hintText: { fontSize: 12, color: '#6366f1' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 6,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterBtnActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  filterText: { fontSize: 12, fontWeight: '500', color: '#6b7280' },
  filterTextActive: { color: '#fff' },
  resultCount: {
    fontSize: 12,
    color: '#9ca3af',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { color: '#9ca3af', fontSize: 14 },
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
    height: 130,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  realImage: { width: '100%', height: 130 },
  productEmoji: { fontSize: 40 },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 3 },
  productShop: { fontSize: 11, color: '#9ca3af', marginBottom: 3 },
  productColors: { fontSize: 11, color: '#6366f1', marginBottom: 3 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#4f46e5' },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#374151', textAlign: 'center', fontWeight: '500' },
  emptySub: { fontSize: 13, color: '#9ca3af', marginTop: 6, textAlign: 'center' },
});