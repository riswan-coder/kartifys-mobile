import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API = axios.create({
  baseURL: 'https://kartifys-backend-production.up.railway.app/api',
  timeout: 15000,
});

API.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.log('Token error:', e);
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Error:', error.message);
    console.log('API Error response:', error.response?.data);
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    }
    return Promise.reject(error);
  }
);

export default API;