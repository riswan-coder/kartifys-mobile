import {
  View, Image, TouchableOpacity,
  StyleSheet, StatusBar, Text
} from 'react-native';
import { useEffect } from 'react';

export default function AdScreen({ route, navigation }) {
  const { ad } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.goBack();
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleShopPress = () => {
    navigation.goBack();
    setTimeout(() => {
      navigation.navigate('ShopDetail', {
        shopId: ad.shop?.id,
        shopName: ad.shop?.name
      });
    }, 300);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleShopPress}
        activeOpacity={1}
      >
        <Image
          source={{ uri: ad.image_url }}
          style={styles.adImage}
          resizeMode="cover"
        />
        <View style={styles.tapHint}>
          <Text style={styles.tapText}>Tap to visit shop</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  imageContainer: { flex: 1 },
  adImage: { width: '100%', height: '100%' },
  tapHint: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  tapText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});