import api from './axios';

export const fetchClients = (params) =>
  api.get('/clients', { params }).then((r) => r.data);

export const fetchClient = (id) =>
  api.get(`/clients/${id}`).then((r) => r.data.data);

export const updateClient = (id, body) =>
  api.put(`/clients/${id}`, body).then((r) => r.data.data);
