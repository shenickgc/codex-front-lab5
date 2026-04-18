import api from './api';

export async function registerRequest(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function loginRequest(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data;
}

export async function profileRequest() {
  const { data } = await api.get('/auth/profile');
  return data;
}
