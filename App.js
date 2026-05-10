import {
  ActivityIndicator, View, Text,
  Animated, StyleSheet
} from 'react-native';
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import ProductsScreen from './src/screens/home/ProductsScreen';
import ShopDetailScreen from './src/screens/shop/ShopDetailScreen';
import ProductDetailScreen from './src/screens/product/ProductDetailScreen';
import PlaceOrderScreen from './src/screens/order/PlaceOrderScreen';
import MyOrdersScreen from './src/screens/order/MyOrdersScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import AdScreen from './src/screens/AdScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function SplashScreen({ onFinish }) {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.7);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={splash.container}>
      <Animated.View style={[
        splash.content,
        { opacity, transform: [{ scale }] }
      ]}>
        <View style={splash.logoBox}>
          <View style={splash.logoRow}>
            <Text style={splash.logoT}>k</Text>
          </View>
        </View>
        <Text style={splash.appName}>kartifys</Text>
        <Text style={splash.tagline}>Shop local · delivered to you</Text>
      </Animated.View>
      <View style={splash.bottom}>
        <ActivityIndicator color="rgba(255,255,255,0.6)" size="small" />
      </View>
    </View>
  );
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoBox: {
    width: 110,
    height: 110,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  logoT: {
    fontSize: 54,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 58,
  },
  logoK: {
    fontSize: 36,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: '#c7d2fe',
    letterSpacing: 0.5,
  },
  bottom: {
    position: 'absolute',
    bottom: 60,
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#f1f5f9',
          paddingBottom: 8,
          paddingTop: 4,
          height: 62,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Shops',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>
              {focused ? '🏪' : '🏬'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={MyOrdersScreen}
        options={{
          tabBarLabel: 'My Orders',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>
              {focused ? '📦' : '📫'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>
              {focused ? '👤' : '🧑'}
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="PlaceOrder" component={PlaceOrderScreen} />
      <Stack.Screen name="Orders" component={MyOrdersScreen} />
      <Stack.Screen
        name="AdScreen"
        component={AdScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}

 function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{
          width: 80, height: 80,
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 38, fontWeight: '900', color: '#fcf6f6' }}>k</Text>
            <Text style={{ fontSize: 26, fontWeight: '700', color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>k</Text>
          </View>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 1 }}>
          kartify
        </Text>
        <ActivityIndicator color="rgba(255,255,255,0.6)" size="small" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return <RootStack />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      )}
    </AuthProvider>
  );
}