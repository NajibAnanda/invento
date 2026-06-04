import api from '../lib/axios'

const dashboardService = {
  getSummary: () => api.get('/dashboard'),
}

export default dashboardService
