import { api } from '../lib/api'

export const vmService = {
  list: () => api.get('/api/vms'),
  get: (id) => api.get(`/api/vms/${id}`),
  create: (data) => api.post('/api/vms', data),
  update: (id, data) => api.patch(`/api/vms/${id}`, data),
  remove: (id) => api.delete(`/api/vms/${id}`),
}
