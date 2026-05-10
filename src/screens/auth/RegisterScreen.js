import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useState } from 'react';
import { registerApi, loginApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import API from '../../api/axios';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();

  const handleRegister = async () => {
    if (!form.username) {
      Alert.alert('Error', 'Username is required');
      return;
    }
    if (!form.phone) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    if (!form.password) {
      Alert.alert('Error', 'Password is required');
      return;
    }
    if (form.password !== form.confirm_password) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
        role: 'customer',
      };
      if (form.email.trim()) {
        payload.email = form.email.trim();
      }

      await registerApi(payload);

      const loginRes = await loginApi({
        username: form.username.trim(),
        password: form.password,
      });

      const { access, refresh } = loginRes.data;

      await SecureStore.setItemAsync('access_token', access);
      await SecureStore.setItemAsync('refresh_token', refresh);

      const profileRes = await API.get('/auth/profile/');
      const userData = profileRes.data;

      await loginUser(access, refresh, userData);

    } catch (err) {
      console.log('Register error:', err.message);
      console.log('Register response:', JSON.stringify(err.response?.data));

      if (!err.response) {
        Alert.alert('Connection Error', 'Cannot connect to server.');
        return;
      }

      if (err.config?.url?.includes('login')) {
        Alert.alert(
          'Account Created!',
          'Your account was created successfully. Please login.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }

      const data = err.response?.data;
      const msg =
        data?.username?.[0] ||
        data?.phone?.[0] ||
        data?.password?.[0] ||
        data?.email?.[0] ||
        data?.non_field_errors?.[0] ||
        data?.detail ||
        'Registration failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.logoBox}>
          <Text style={styles.logoText}>E</Text>
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join TrendKart to shop local stores</Text>

        <View style={styles.form}>

          <Text style={styles.label}>Username <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Choose a username"
            placeholderTextColor="#9ca3af"
            value={form.username}
            onChangeText={v => setForm({ ...form, username: v })}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone number <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Your phone number"
            placeholderTextColor="#9ca3af"
            value={form.phone}
            onChangeText={v => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#9ca3af"
            value={form.email}
            onChangeText={v => setForm({ ...form, email: v })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 8 characters"
            placeholderTextColor="#9ca3af"
            value={form.password}
            onChangeText={v => setForm({ ...form, password: v })}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm password <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Repeat your password"
            placeholderTextColor="#9ca3af"
            value={form.confirm_password}
            onChangeText={v => setForm({ ...form, confirm_password: v })}
            secureTextEntry
          />

          <Text style={styles.note}><Text style={styles.required}>*</Text> Required fields</Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 24, paddingTop: 50, paddingBottom: 40 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#4f46e5', alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  form: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  required: { color: '#ef4444', fontWeight: '600' },
  optional: { color: '#9ca3af', fontWeight: '400', fontSize: 12 },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#111827', marginBottom: 16, backgroundColor: '#f9fafb',
  },
  note: { fontSize: 12, color: '#9ca3af', marginBottom: 16 },
  btn: {
    backgroundColor: '#4f46e5', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#6b7280', fontSize: 13 },
  linkBold: { color: '#4f46e5', fontWeight: '600' },
});