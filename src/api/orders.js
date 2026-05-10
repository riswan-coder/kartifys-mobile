import API from './axios';

export const placeOrder = (data) => API.post('/orders/my/', data);
export const getMyOrders = () => API.get('/orders/my/');
export const getOrderDetail = (id) => API.get(`/orders/my/${id}/`);