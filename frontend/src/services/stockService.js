import api from '../lib/axios'

const stockService = {
  stockIn: (payload) => api.post('/stock-in', payload),
  getMovements: (params) => api.get('/stock-movements', { params }),
}

export default stockService
