import API from './axios';

export const getProducts = (params) => API.get('/products/', { params });
export const getProductDetail = (id) => API.get(`/products/${id}/`);
export const getCategories = () => API.get('/products/categories/');