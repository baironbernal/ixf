import { api, csrf } from '../lib/api'

export const authService = {
  me: () => api.get('/api/user'),

  login: async (email, password) => {
    await csrf()
    return api.post('/api/login', { email, password })
  },

  register: async (fields) => {
    await csrf()
    return api.post('/api/register', fields)
  },

  logout: () => api.post('/api/logout'),
}
