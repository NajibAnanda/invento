import api from '../lib/axios'

const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (payload) => api.post('/transactions', payload),
  cancel: (id) => api.put(`/transactions/${id}/cancel`),
}

export default transactionService
