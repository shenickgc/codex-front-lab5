import api from './api';

export async function getQuotesRequest() {
  const { data } = await api.get('/quotes');
  return data;
}

export async function createQuoteRequest(payload) {
  const { data } = await api.post('/quotes', payload);
  return data;
}

export async function updateQuoteRequest(id, payload) {
  const { data } = await api.put(`/quotes/${id}`, payload);
  return data;
}

export async function deleteQuoteRequest(id) {
  const { data } = await api.delete(`/quotes/${id}`);
  return data;
}
