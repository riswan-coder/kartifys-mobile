import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { useState } from 'react';
import { loginApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import API from '../../api/axios';

export default function LoginScreen({ navigation }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

const handleLogin = async () => {
  if (!form.username || !form.password) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }
  setLoading(true);
  try {
    const res = await loginApi(form);
    const { access, refresh } = res.data;

    await SecureStore.setItemAsync('access_token', access);
    await SecureStore.setItemAsync('refresh_token', refresh);

    const profileRes = await API.get('/auth/profile/');
    const userData = profileRes.data;

    if (userData.role !== 'customer') {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      Alert.alert(
        'Access Denied',
        'This app is for customers only.\nUse the web dashboard instead.'
      );
      return;
    }

    await loginUser(access, refresh, userData);
    // Navigate to home immediately
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });

  } catch (err) {
    if (!err.response) {
      Alert.alert('Connection Error', 'Cannot connect to server.');
      return;
    }
    Alert.alert('Login Failed', 'Invalid username or password.');
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        <View style={styles.logoBox}>
          <Text style={styles.logoText}>k</Text>
        </View>
        <Text style={styles.title}>Kartify</Text>
        <Text style={styles.subtitle}>Shop local, delivered to you</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor="#9ca3af"
            value={form.username}
            onChangeText={v => setForm({ ...form, username: v })}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#9ca3af"
            value={form.password}
            onChangeText={v => setForm({ ...form, password: v })}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Sign In</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkBold}>Register</Text>
            </Text>
          </TouchableOpacity>

          {/* ADD THIS BELOW */}
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.linkText}>
              Forgot password? <Text style={styles.linkBold}>Reset via SMS</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: '#4f46e5', alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 4, marginBottom: 32 },
  form: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#111827', marginBottom: 16, backgroundColor: '#f9fafb',
  },
  btn: {
    backgroundColor: '#4f46e5', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center', marginTop: 4,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#6b7280', fontSize: 13 },
  linkBold: { color: '#4f46e5', fontWeight: '600' },
});