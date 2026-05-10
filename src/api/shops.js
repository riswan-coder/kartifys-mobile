import API from './axios';

export const getShops = () => API.get('/shops/');
export const getShopDetail = (id) => API.get(`/shops/${id}/`);
