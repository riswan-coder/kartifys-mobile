import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logoutUser } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: logoutUser }
    ]);
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.guestIcon}>👤</Text>
        <Text style={styles.guestTitle}>You are not logged in</Text>
        <Text style={styles.guestSub}>Login to view your profile and orders</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerBtnText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.username[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Info cards */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{user.username}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user.phone || 'Not set'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account type</Text>
            <Text style={styles.infoValue}>Customer</Text>
          </View>
        </View>
      </View>

      {/* Quick links */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('OrdersTab')}
        >
          <Text style={styles.menuIcon}>📦</Text>
          <Text style={styles.menuText}>My Orders</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { backgroundColor: '#4f46e5', padding: 32, paddingTop: 60, alignItems: 'center' },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  username: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 13, color: '#c7d2fe', marginTop: 4 },
  section: { padding: 16, paddingBottom: 0 },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  infoLabel: { fontSize: 14, color: '#6b7280' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  divider: { height: 1, backgroundColor: '#f9fafb' },
  menuItem: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#111827' },
  menuArrow: { fontSize: 22, color: '#d1d5db' },
  logoutBtn: {
    backgroundColor: '#fee2e2', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 32,
  },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
  guestIcon: { fontSize: 56, marginBottom: 16 },
  guestTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  guestSub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  loginBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 40, paddingVertical: 13, borderRadius: 12, marginBottom: 12, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  registerBtn: { borderWidth: 1, borderColor: '#4f46e5', paddingHorizontal: 40, paddingVertical: 13, borderRadius: 12, width: '100%', alignItems: 'center' },
  registerBtnText: { color: '#4f46e5', fontWeight: '600', fontSize: 15 },
});