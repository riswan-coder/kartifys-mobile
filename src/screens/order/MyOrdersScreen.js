import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { useEffect, useState } from 'react';
import { getMyOrders } from '../../api/orders';
import { useAuth } from '../../context/AuthContext';

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data);
    } catch {
      console.log('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statusColors = {
    pending:   { bg: '#fef9c3', text: '#854d0e' },
    confirmed: { bg: '#dbeafe', text: '#1e40af' },
    shipped:   { bg: '#ede9fe', text: '#5b21b6' },
    delivered: { bg: '#dcfce7', text: '#166534' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' },
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.guestIcon}>📦</Text>
        <Text style={styles.guestTitle}>Login to view your orders</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>{orders.length} total orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchOrders(); }}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>
              Your orders will appear here after you shop
            </Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Text style={styles.shopBtnText}>Browse Shops</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const statusStyle = statusColors[item.status] || statusColors.pending;
          return (
            <View style={styles.orderCard}>

              {/* Order header */}
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{item.id}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: statusStyle.bg }
                ]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Order items */}
              <View style={styles.itemsSection}>
                {item.items?.map((orderItem, i) => (
                  <Text key={i} style={styles.itemText}>
                    · {orderItem.product?.name}
                    {orderItem.size ? ` (${orderItem.size})` : ''}
                    {orderItem.color ? ` · ${orderItem.color}` : ''}
                    {' '}× {orderItem.quantity}
                  </Text>
                ))}
              </View>

              {/* Delivery info */}
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryAddress} numberOfLines={1}>
                  📍 {item.delivery_address}
                </Text>
                {item.delivery_pincode ? (
                  <Text style={styles.pincode}>
                    📮 {item.delivery_pincode}
                  </Text>
                ) : null}
              </View>

              {/* Cancel reason */}
              {item.status === 'cancelled' && item.cancel_reason ? (
                <View style={styles.cancelReasonBox}>
                  <Text style={styles.cancelReasonLabel}>
                    Cancelled: {' '}
                  </Text>
                  <Text style={styles.cancelReasonText}>
                    {item.cancel_reason}
                  </Text>
                </View>
              ) : null}

              {/* Total */}
              <View style={styles.orderFooter}>
                <Text style={styles.paymentMethod}>Cash on Delivery</Text>
                <Text style={styles.orderTotal}>₹{item.total_price}</Text>
              </View>

            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: 20,
  },

  header: {
    backgroundColor: '#4f46e5',
    padding: 24,
    paddingTop: 56,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: '#c7d2fe', marginTop: 2 },

  list: { padding: 16 },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 1,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 15, fontWeight: '700', color: '#111827',
  },
  orderDate: {
    fontSize: 12, color: '#9ca3af', marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12, fontWeight: '600',
  },

  itemsSection: { marginBottom: 10 },
  itemText: {
    fontSize: 13, color: '#374151',
    marginBottom: 3, lineHeight: 18,
  },

  deliveryRow: {
    marginBottom: 8,
    gap: 3,
  },
  deliveryAddress: {
    fontSize: 12, color: '#6b7280',
  },
  pincode: {
    fontSize: 12, color: '#6b7280',
  },

  cancelReasonBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  cancelReasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991b1b',
  },
  cancelReasonText: {
    fontSize: 12,
    color: '#991b1b',
    flex: 1,
  },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
    paddingTop: 10,
    marginTop: 4,
  },
  paymentMethod: {
    fontSize: 12, color: '#9ca3af',
  },
  orderTotal: {
    fontSize: 16, fontWeight: '700', color: '#4f46e5',
  },

  empty: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyTitle: {
    fontSize: 18, fontWeight: '700',
    color: '#111827', marginBottom: 6,
  },
  emptySub: {
    fontSize: 13, color: '#9ca3af',
    textAlign: 'center', marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopBtnText: {
    color: '#fff', fontWeight: '600', fontSize: 14,
  },

  guestIcon: { fontSize: 48, marginBottom: 14 },
  guestTitle: {
    fontSize: 16, color: '#374151',
    fontWeight: '500', marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#fff', fontWeight: '600', fontSize: 15,
  },
});