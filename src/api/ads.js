import API from './axios';

export const getActiveAd = () => API.get('/ads/popup/');
export const getAllActiveAds = () => API.get('/ads/banners/');