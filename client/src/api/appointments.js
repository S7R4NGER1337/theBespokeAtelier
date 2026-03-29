import api from './axios';

export const fetchAppointments = (params) =>
  api.get('/appointments', { params }).then((r) => r.data);

export const fetchAppointment = (id) =>
  api.get(`/appointments/${id}`).then((r) => r.data.data);

export const fetchAvailableSlots = (barberId, date) =>
  api.get('/appointments/available-slots', { params: { barberId, date } }).then((r) => r.data.data);

export const createAppointment = (body) =>
  api.post('/appointments', body).then((r) => r.data.data);

export const updateAppointmentStatus = (id, status, cancelReason) =>
  api.patch(`/appointments/${id}/status`, { status, cancelReason }).then((r) => r.data.data);

export const fetchStats = () =>
  api.get('/appointments/stats').then((r) => r.data.data);
