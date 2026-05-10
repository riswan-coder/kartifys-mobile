import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image, FlatList
} from 'react-native';
import { useEffect, useState } from 'react';
import { getProductDetail } from '../../api/products';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await getProductDetail(productId);
      setProduct(res.data);
    } catch {
      Alert.alert('Error', 'Could not load product');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to place an order', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') }
      ]);
      return;
    }
    navigation.navigate('PlaceOrder', {
      product,
      selectedSize,
      selectedColor,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const sizes = product?.sizes
    ? product.sizes.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const colors = product?.colors
    ? product.colors.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  const images = product?.images?.filter(img => img.image) || [];
  const selectedImage = images[selectedImageIndex];

  return (
    <View style={styles.container}>
      <ScrollView>

        {/* Main image */}
        <View style={styles.imageBox}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          {selectedImage?.image ? (
            <Image
              source={{ uri: selectedImage.image }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.productEmoji}>
              {product?.category?.product_type === 'shoes' ? '👟' : '👕'}
            </Text>
          )}
        </View>

        {/* Image thumbnails — show all images */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbRow}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={img.id}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbBox,
                  selectedImageIndex === index && styles.thumbBoxActive
                ]}
              >
                <Image
                  source={{ uri: img.image }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>

          {/* Shop name */}
          <Text style={styles.shopName}>{product?.shop_name}</Text>

          {/* Product name and price */}
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{product?.name}</Text>
            <Text style={styles.price}>₹{product?.price}</Text>
          </View>

          {/* Category badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {product?.category?.gender} · {product?.category?.product_type}
            </Text>
          </View>

          {/* Description */}
          {product?.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : null}

          {/* Colors */}
          {colors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Color</Text>
              <View style={styles.optionRow}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.optionBtn,
                      selectedColor === color && styles.optionBtnActive
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedColor === color && styles.optionTextActive
                    ]}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Size</Text>
              <View style={styles.optionRow}>
                {sizes.map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionBtn,
                      selectedSize === size && styles.optionBtnActive
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedSize === size && styles.optionTextActive
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Stock */}
          <Text style={styles.stockText}>
            {product?.stock > 0
              ? `${product.stock} items in stock`
              : 'Out of stock'
            }
          </Text>

        </View>
      </ScrollView>

      {/* Bottom order button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceBottom}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>₹{product?.price}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.orderBtn,
            product?.stock === 0 && styles.orderBtnDisabled
          ]}
          onPress={handleOrder}
          disabled={product?.stock === 0}
        >
          <Text style={styles.orderBtnText}>
            {product?.stock === 0 ? 'Out of Stock' : 'Order Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Main image
  imageBox: {
    height: 280,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backText: { color: '#4f46e5', fontSize: 18, fontWeight: '600' },
  mainImage: { width: '100%', height: 280 },
  productEmoji: { fontSize: 80 },

  // Thumbnails
  thumbRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  thumbBox: {
    width: 64, height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  thumbBoxActive: {
    borderColor: '#4f46e5',
  },
  thumbImage: { width: '100%', height: '100%' },

  content: { padding: 16 },
  shopName: { fontSize: 12, color: '#9ca3af', marginBottom: 6 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productName: {
    fontSize: 20, fontWeight: '700', color: '#111827',
    flex: 1, marginRight: 10,
  },
  price: { fontSize: 22, fontWeight: '700', color: '#4f46e5' },
  badge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16,
  },
  badgeText: {
    fontSize: 12, color: '#4f46e5',
    fontWeight: '500', textTransform: 'capitalize',
  },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 14, fontWeight: '600',
    color: '#374151', marginBottom: 10,
  },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1,
    borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  optionBtnActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  optionText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  optionTextActive: { color: '#4f46e5' },
  stockText: { fontSize: 13, color: '#10b981', marginTop: 4 },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  priceBottom: { flex: 1 },
  priceLabel: { fontSize: 12, color: '#9ca3af' },
  priceValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  orderBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 12,
  },
  orderBtnDisabled: { backgroundColor: '#d1d5db' },
  orderBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});