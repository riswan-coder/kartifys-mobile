import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useState, useRef } from 'react';
import API from '../../api/axios';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const otpRefs = useRef([]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/send-otp/', { phone });
      Alert.alert('OTP Sent!', res.data.message);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send OTP';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/verify-otp/', { phone, code });
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid OTP';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/reset-password-otp/', {
        phone,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      Alert.alert(
        'Success!',
        'Your password has been reset. Please login.',
        [{ text: 'Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      const msg = err.response?.data?.error || 'Reset failed';
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

        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>E</Text>
        </View>
        <Text style={styles.title}>Forgot Password</Text>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                step >= s && styles.stepCircleActive
              ]}>
                <Text style={[
                  styles.stepNum,
                  step >= s && styles.stepNumActive
                ]}>{s}</Text>
              </View>
              <Text style={[
                styles.stepLabel,
                step >= s && styles.stepLabelActive
              ]}>
                {s === 1 ? 'Phone' : s === 2 ? 'OTP' : 'Password'}
              </Text>
              {i < 2 && (
                <View style={[
                  styles.stepLine,
                  step > s && styles.stepLineActive
                ]} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.form}>

          {/* Step 1 — Enter phone */}
          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>Enter your phone number</Text>
              <Text style={styles.stepSub}>
                We'll send a 6-digit OTP to your registered phone number
              </Text>
              <Text style={styles.label}>Phone number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter phone number"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <TouchableOpacity
                style={styles.btn}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Send OTP</Text>
                }
              </TouchableOpacity>
            </>
          )}

          {/* Step 2 — Enter OTP */}
          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>Enter OTP</Text>
              <Text style={styles.stepSub}>
                Enter the 6-digit code sent to {phone}
              </Text>

              {/* OTP boxes */}
              <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => otpRefs.current[index] = ref}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null
                    ]}
                    value={digit}
                    onChangeText={v => handleOtpChange(v.slice(-1), index)}
                    onKeyPress={e => handleOtpKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>

              <TouchableOpacity
                style={styles.btn}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Verify OTP</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleSendOTP}
              >
                <Text style={styles.resendText}>
                  Didn't receive OTP? <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 3 — New password */}
          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>Set new password</Text>
              <Text style={styles.stepSub}>
                OTP verified! Now create your new password.
              </Text>
              <Text style={styles.label}>New password</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#9ca3af"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat new password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.btn}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Reset Password</Text>
                }
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => step === 1 ? navigation.goBack() : setStep(step - 1)}
          >
            <Text style={styles.backText}>
              {step === 1 ? '← Back to login' : '← Go back'}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  logoBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#4f46e5', alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  title: {
    fontSize: 22, fontWeight: '700',
    color: '#111827', textAlign: 'center', marginBottom: 24,
  },

  // Step indicator
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 28,
    gap: 0,
  },
  stepItem: {
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: { backgroundColor: '#4f46e5' },
  stepNum: { fontSize: 13, fontWeight: '600', color: '#9ca3af' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: '#9ca3af' },
  stepLabelActive: { color: '#4f46e5', fontWeight: '500' },
  stepLine: {
    position: 'absolute',
    top: 16,
    left: 36,
    width: 60,
    height: 2,
    backgroundColor: '#e5e7eb',
  },
  stepLineActive: { backgroundColor: '#4f46e5' },

  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  stepTitle: {
    fontSize: 16, fontWeight: '600',
    color: '#111827', marginBottom: 6,
  },
  stepSub: {
    fontSize: 13, color: '#6b7280',
    marginBottom: 20, lineHeight: 20,
  },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },

  // Phone input
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  countryCode: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 14, fontWeight: '500', color: '#111827',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#111827',
    backgroundColor: '#f9fafb',
  },

  // OTP boxes
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  otpBox: {
    width: 44, height: 52,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#f9fafb',
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },

  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: '#111827',
    marginBottom: 14, backgroundColor: '#f9fafb',
  },
  btn: {
    backgroundColor: '#4f46e5', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center', marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  backBtn: { alignItems: 'center', paddingVertical: 8 },
  backText: { color: '#6b7280', fontSize: 13 },
  resendBtn: { alignItems: 'center', marginTop: 4 },
  resendText: { color: '#6b7280', fontSize: 13 },
  resendLink: { color: '#4f46e5', fontWeight: '600' },
});