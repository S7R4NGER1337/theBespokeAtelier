import api from './axios';

export const fetchBarbers = () =>
  api.get('/barbers').then((r) => r.data.data);

export const fetchBarber = (id) =>
  api.get(`/barbers/${id}`).then((r) => r.data.data);

export const createBarber = (body) =>
  api.post('/barbers', body).then((r) => r.data.data);

export const updateBarber = (id, body) =>
  api.put(`/barbers/${id}`, body).then((r) => r.data.data);

export const deleteBarber = (id) =>
  api.delete(`/barbers/${id}`).then((r) => r.data);
