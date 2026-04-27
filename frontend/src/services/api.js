import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || 'https://dashboard-ptl.onrender.com/api';

// Map _id to id for frontend compatibility with MongoDB backend
axios.interceptors.response.use(response => {
  if (response.data && response.data.data) {
    const mapId = (item) => {
      if (item && typeof item === 'object' && item._id && !item.id) {
        item.id = item._id;
      }
      return item;
    };
    if (Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map(mapId);
    } else {
      response.data.data = mapId(response.data.data);
    }
  }
  return response;
});

export const dashboardAPI = {
  getStats: () => axios.get(`${API_BASE}/dashboard/stats`),
  
  getLeads: () => axios.get(`${API_BASE}/dashboard/leads`),
  createLead: (data) => axios.post(`${API_BASE}/dashboard/leads`, data),
  updateLead: (id, data) => axios.put(`${API_BASE}/dashboard/leads/${id}`, data),
  deleteLead: (id) => axios.delete(`${API_BASE}/dashboard/leads/${id}`),

  getTasks: () => axios.get(`${API_BASE}/dashboard/tasks`),
  createTask: (data) => axios.post(`${API_BASE}/dashboard/tasks`, data),
  updateTask: (id, data) => axios.put(`${API_BASE}/dashboard/tasks/${id}`, data),
  deleteTask: (id) => axios.delete(`${API_BASE}/dashboard/tasks/${id}`),

  getUsers: () => axios.get(`${API_BASE}/dashboard/users`),
};