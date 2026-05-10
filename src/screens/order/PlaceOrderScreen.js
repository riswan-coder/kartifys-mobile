import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useState } from 'react';
import { placeOrder } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';

export default function PlaceOrderScreen({ route, navigation }) {
  const { product, selectedSize, selectedColor } = route.params;
  const { user } = useAuth();
  const [form, setForm] = useState({
    delivery_address: '',
    delivery_phone: user?.phone || '',
    delivery_pincode: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!form.delivery_address) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }
    if (!form.delivery_phone) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }
    if (!form.delivery_pincode) {
      Alert.alert('Error', 'Please enter pincode');
      return;
    }
    if (form.delivery_pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    try {
      await placeOrder({
        delivery_address: form.delivery_address,
        delivery_phone: form.delivery_phone,
        delivery_pincode: form.delivery_pincode,
        note: form.note,
        items: [{
          product_id: product.id,
          quantity: 1,
          price: parseFloat(product.price),
          size: selectedSize || '',
          color: selectedColor || '',
        }]
      });
      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully. The shop will confirm it soon.',
        [{ text: 'OK', onPress: () => navigation.navigate('Main') }]
      );
    } catch (err) {
      console.log(err.response?.data);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Place Order</Text>
        </View>

        {/* Order summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Product</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>
              {product.name}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shop</Text>
            <Text style={styles.summaryValue}>{product.shop_name}</Text>
          </View>
          {selectedSize ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Size</Text>
              <Text style={styles.summaryValue}>{selectedSize}</Text>
            </View>
          ) : null}
          {selectedColor ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Color</Text>
              <Text style={styles.summaryValue}>{selectedColor}</Text>
            </View>
          ) : null}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{product.price}</Text>
          </View>
          <View style={styles.codBadge}>
            <Text style={styles.codText}>💵 Cash on Delivery (COD)</Text>
          </View>
        </View>

        {/* Delivery details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>

          {/* Address */}
          <Text style={styles.label}>
            Delivery Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your full delivery address"
            placeholderTextColor="#9ca3af"
            value={form.delivery_address}
            onChangeText={v => setForm({ ...form, delivery_address: v })}
            multiline
            numberOfLines={3}
          />

          {/* Phone */}
          <Text style={styles.label}>
            Phone Number <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Your phone number"
            placeholderTextColor="#9ca3af"
            value={form.delivery_phone}
            onChangeText={v => setForm({ ...form, delivery_phone: v })}
            keyboardType="phone-pad"
          />

          {/* Pincode */}
          <Text style={styles.label}>
            Pincode <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit area pincode"
            placeholderTextColor="#9ca3af"
            value={form.delivery_pincode}
            onChangeText={v => setForm({ ...form, delivery_pincode: v })}
            keyboardType="number-pad"
            maxLength={6}
          />

          {/* Note */}
          <Text style={styles.label}>
            Note to shop <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special instructions..."
            placeholderTextColor="#9ca3af"
            value={form.note}
            onChangeText={v => setForm({ ...form, note: v })}
            multiline
            numberOfLines={2}
          />

          <Text style={styles.requiredNote}>
            <Text style={styles.required}>*</Text> Required fields
          </Text>
        </View>

      </ScrollView>

      {/* Place order button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.orderBtn}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.orderBtnText}>
                Confirm Order — ₹{product.price}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16, paddingBottom: 100 },

  header: { marginBottom: 16 },
  backText: { color: '#4f46e5', fontSize: 16, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 14,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  summaryLabel: { fontSize: 13, color: '#6b7280', flex: 0.4 },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    flex: 0.6,
    textAlign: 'right',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#4f46e5' },

  codBadge: {
    backgroundColor: '#fef9c3',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  codText: { fontSize: 13, color: '#854d0e', fontWeight: '500' },

  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 4,
  },
  required: { color: '#ef4444', fontWeight: '600' },
  optional: { color: '#9ca3af', fontWeight: '400', fontSize: 12 },
  requiredNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
    marginBottom: 14,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  bottomBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  orderBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  orderBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});