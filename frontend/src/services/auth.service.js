import { api, csrf } from '../lib/api'

const unwrap = (res) => res?.data ?? res

export const authService = {
  me: () => api.get('/api/user').then(unwrap),

  login: async (email, password) => {
    await csrf()
    return api.post('/api/login', { email, password }).then(unwrap)
  },

  register: async (fields) => {
    await csrf()
    return api.post('/api/register', fields).then(unwrap)
  },

  logout: () => api.post('/api/logout'),
}
