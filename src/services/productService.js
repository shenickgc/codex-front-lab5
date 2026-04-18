import api from './api';

export async function getProductsRequest() {
  const { data } = await api.get('/products');
  return data;
}

export async function createProductRequest(payload) {
  const { data } = await api.post('/products', payload);
  return data;
}

export async function updateProductRequest(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
}

export async function deleteProductRequest(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}
