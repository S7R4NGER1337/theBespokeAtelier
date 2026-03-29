import api from './axios';

export const fetchServices = (category) =>
  api.get('/services', { params: category ? { category } : {} }).then((r) => r.data.data);

export const fetchService = (id) =>
  api.get(`/services/${id}`).then((r) => r.data.data);

export const createService = (body) =>
  api.post('/services', body).then((r) => r.data.data);

export const updateService = (id, body) =>
  api.put(`/services/${id}`, body).then((r) => r.data.data);

export const deleteService = (id) =>
  api.delete(`/services/${id}`).then((r) => r.data);
