import api from '../lib/axios'

const reportService = {
  getSales: (params) => api.get('/reports/sales', { params }),
}

export default reportService
