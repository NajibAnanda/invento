import api from '../lib/axios'

const supplierService = {
  getAll: () => api.get('/suppliers'),
  create: (payload) => api.post('/suppliers', payload),
  update: (id, payload) => api.put(`/suppliers/${id}`, payload),
  remove: (id) => api.delete(`/suppliers/${id}`),
}

export default supplierService
