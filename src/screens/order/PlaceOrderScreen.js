import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal
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
  const [showPolicy, setShowPolicy] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyLang, setPolicyLang] = useState('english');

  const handlePlaceOrder = async () => {
    if (!policyAccepted) {
      Alert.alert(
        'Return Policy',
        'Please read and accept the Return Policy before placing your order.',
        [{ text: 'Read Policy', onPress: () => setShowPolicy(true) }]
      );
      return;
    }
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

      {/* Return Policy Modal */}
      <Modal
        visible={showPolicy}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPolicy(false)}
      >
        <View style={pStyles.overlay}>
          <View style={pStyles.modal}>

            {/* Header */}
            <View style={pStyles.modalHeader}>
              <Text style={pStyles.modalTitle}>
                {policyLang === 'english' ? 'Return & Exchange Policy' : 'റിട്ടേൺ & എക്സ്ചേഞ്ച് നയം'}
              </Text>
              <View style={pStyles.langRow}>
                <TouchableOpacity
                  onPress={() => setPolicyLang('english')}
                  style={[pStyles.langBtn, policyLang === 'english' && pStyles.langBtnActive]}
                >
                  <Text style={[pStyles.langText, policyLang === 'english' && pStyles.langTextActive]}>
                    English
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPolicyLang('malayalam')}
                  style={[pStyles.langBtn, policyLang === 'malayalam' && pStyles.langBtnActive]}
                >
                  <Text style={[pStyles.langText, policyLang === 'malayalam' && pStyles.langTextActive]}>
                    മലയാളം
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Warning */}
            <View style={pStyles.warningBox}>
              <Text style={pStyles.warningText}>
                ⚠️ {policyLang === 'english'
                  ? 'MANDATORY: Record unboxing video before opening!'
                  : 'നിർബന്ധം: തുറക്കുന്നതിന് മുമ്പ് വീഡിയോ എടുക്കുക!'}
              </Text>
            </View>

            {/* Policy points */}
            <ScrollView style={pStyles.policyScroll}>
              {(policyLang === 'english' ? [
                'Returns accepted ONLY if the product is damaged/defective or if you received a wrong product.',
                'Record a video BEFORE breaking the box seal.',
                'Without unboxing video, returns will NOT be accepted.',
                'Video must show intact seal, then product inside clearly.',
                'Return request must be raised within 24 hours.',
                'Same product will be exchanged — no cash refunds.',
                'Used or customer-damaged products not accepted.',
              ] : [
                'ഉൽപ്പന്നം കേടായിട്ടുണ്ടെങ്കിൽ അല്ലെങ്കിൽ തെറ്റായ ഉൽപ്പന്നം ലഭിച്ചിട്ടുണ്ടെങ്കിൽ മാത്രമേ റിട്ടേൺ സ്വീകരിക്കൂ.',
                'ബോക്സ് സീൽ പൊട്ടിക്കുന്നതിന് മുമ്പ് വീഡിയോ എടുക്കണം.',
                'അൺബോക്സിംഗ് വീഡിയോ ഇല്ലാതെ റിട്ടേൺ സ്വീകരിക്കില്ല.',
                'വീഡിയോയിൽ സീൽ, ഉൽപ്പന്നം വ്യക്തമായി കാണണം.',
                'ഡെലിവറി ലഭിച്ച് 24 മണിക്കൂറിനകം അഭ്യർത്ഥന നൽകണം.',
                'അതേ ഉൽപ്പന്നം മാറ്റിനൽകും — പണം തിരിച്ചുനൽകില്ല.',
                'ഉപയോഗിച്ചതോ കേടാക്കിയതോ ആയ ഉൽപ്പന്നങ്ങൾ സ്വീകരിക്കില്ല.',
              ]).map((point, i) => (
                <View key={i} style={pStyles.point}>
                  <View style={pStyles.pointNum}>
                    <Text style={pStyles.pointNumText}>{i + 1}</Text>
                  </View>
                  <Text style={pStyles.pointText}>{point}</Text>
                </View>
              ))}

              {/* Video steps */}
              <View style={pStyles.videoBox}>
                <Text style={pStyles.videoTitle}>
                  🎥 {policyLang === 'english' ? 'Unboxing video steps:' : 'വീഡിയോ നിർദ്ദേശങ്ങൾ:'}
                </Text>
                {(policyLang === 'english' ? [
                  'Start recording BEFORE touching the box',
                  'Show full box with seal intact',
                  'Slowly break seal and open on camera',
                  'Show product inside clearly',
                  'Save the video for returns',
                ] : [
                  'ബോക്സ് തൊടുന്നതിന് മുമ്പ് റെക്കോർഡ് ആരംഭിക്കുക',
                  'സീൽ ഉള്ള ബോക്സ് കാമറയിൽ കാണിക്കുക',
                  'സാവധാനം സീൽ പൊട്ടിച്ച് ബോക്സ് തുറക്കുക',
                  'ഉൽപ്പന്നം വ്യക്തമായി കാണിക്കുക',
                  'വീഡിയോ സൂക്ഷിക്കുക',
                ]).map((step, i) => (
                  <Text key={i} style={pStyles.videoStep}>{i + 1}. {step}</Text>
                ))}
              </View>
            </ScrollView>

            {/* Accept */}
            <View style={pStyles.acceptSection}>
              <TouchableOpacity
                style={pStyles.checkRow}
                onPress={() => setPolicyAccepted(!policyAccepted)}
              >
                <View style={[pStyles.checkbox, policyAccepted && pStyles.checkboxChecked]}>
                  {policyAccepted && <Text style={pStyles.checkmark}>✓</Text>}
                </View>
                <Text style={pStyles.checkText}>
                  {policyLang === 'english'
                    ? 'I have read and agree to the return policy. I will record an unboxing video.'
                    : 'ഞാൻ നയം വായിക്കുകയും സമ്മതിക്കുകയും ചെയ്തു. അൺബോക്സിംഗ് വീഡിയോ എടുക്കും.'}
                </Text>
              </TouchableOpacity>
              <View style={pStyles.btnRow}>
                <TouchableOpacity
                  style={pStyles.cancelBtn}
                  onPress={() => setShowPolicy(false)}
                >
                  <Text style={pStyles.cancelText}>
                    {policyLang === 'english' ? 'Cancel' : 'റദ്ദാക്കുക'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[pStyles.acceptBtn, !policyAccepted && pStyles.acceptBtnDisabled]}
                  onPress={() => {
                    if (!policyAccepted) {
                      Alert.alert('', policyLang === 'english'
                        ? 'Please tick the checkbox to accept'
                        : 'ടിക്ക് ചെയ്ത് സ്വീകരിക്കുക'
                      );
                      return;
                    }
                    setShowPolicy(false);
                  }}
                >
                  <Text style={pStyles.acceptText}>
                    {policyLang === 'english' ? 'I Accept' : 'ഞാൻ സമ്മതിക്കുന്നു'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>
      </Modal>

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
            <Text style={styles.summaryValue} numberOfLines={2}>{product.name}</Text>
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

          {/* Return policy button */}
          <TouchableOpacity
            style={styles.policyBtn}
            onPress={() => setShowPolicy(true)}
          >
            <Text style={styles.policyBtnText}>📋 View Return & Exchange Policy</Text>
          </TouchableOpacity>

          {/* Policy accepted badge */}
          {policyAccepted && (
            <View style={styles.acceptedBadge}>
              <Text style={styles.acceptedText}>✅ Return policy accepted</Text>
            </View>
          )}
        </View>

        {/* Delivery details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>

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

          {/* Policy warning if not accepted */}
          {!policyAccepted && (
            <TouchableOpacity
              style={styles.policyWarning}
              onPress={() => setShowPolicy(true)}
            >
              <Text style={styles.policyWarningText}>
                ⚠️ You must read and accept the Return Policy before ordering
              </Text>
              <Text style={styles.policyWarningLink}>Tap here to read and accept →</Text>
            </TouchableOpacity>
          )}

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
            : <Text style={styles.orderBtnText}>Confirm Order — ₹{product.price}</Text>
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
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 14 },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  summaryLabel: { fontSize: 13, color: '#6b7280', flex: 0.4 },
  summaryValue: { fontSize: 13, fontWeight: '500', color: '#111827', flex: 0.6, textAlign: 'right' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, marginTop: 4 },
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

  policyBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  policyBtnText: { color: '#4f46e5', fontSize: 13, fontWeight: '500' },

  acceptedBadge: {
    marginTop: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  acceptedText: { color: '#16a34a', fontSize: 12, fontWeight: '500' },

  policyWarning: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  policyWarningText: { color: '#92400e', fontSize: 12, fontWeight: '500' },
  policyWarningLink: { color: '#b45309', fontSize: 12, marginTop: 4, textDecorationLine: 'underline' },

  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6, marginTop: 4 },
  required: { color: '#ef4444', fontWeight: '600' },
  optional: { color: '#9ca3af', fontWeight: '400', fontSize: 12 },
  requiredNote: { fontSize: 12, color: '#9ca3af', marginTop: 8 },

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
  textArea: { height: 80, textAlignVertical: 'top' },

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
  orderBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

const pStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#f1f5f9' },
  langBtnActive: { backgroundColor: '#4f46e5' },
  langText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  langTextActive: { color: '#fff' },

  warningBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  warningText: { color: '#b91c1c', fontSize: 12, fontWeight: '600' },

  policyScroll: { maxHeight: 320, padding: 16 },
  point: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  pointNum: {
    width: 22, height: 22,
    borderRadius: 11,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  pointNumText: { color: '#4f46e5', fontSize: 11, fontWeight: '700' },
  pointText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },

  videoBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  videoTitle: { fontSize: 13, fontWeight: '600', color: '#92400e', marginBottom: 8 },
  videoStep: { fontSize: 12, color: '#92400e', marginBottom: 4, lineHeight: 18 },

  acceptSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  checkRow: { flexDirection: 'row', gap: 10, marginBottom: 14, alignItems: 'flex-start' },
  checkbox: {
    width: 22, height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkText: { flex: 1, fontSize: 12, color: '#374151', lineHeight: 18 },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1,
    borderColor: '#d1d5db', alignItems: 'center',
  },
  cancelText: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
  acceptBtn: {
    flex: 1, paddingVertical: 12,
    borderRadius: 10, backgroundColor: '#4f46e5', alignItems: 'center',
  },
  acceptBtnDisabled: { backgroundColor: '#a5b4fc' },
  acceptText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});