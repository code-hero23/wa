import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  verify: () => api.get('/auth/verify'),
};

export const campaignService = {
  create: (data) => api.post('/campaigns/send', data),
  getAll: () => api.get('/campaigns'),
  getTemplates: () => api.get('/campaigns/templates'),
};

export const messageService = {
  getAll: () => api.get('/campaigns/messages'),
};

export const chatService = {
  getChats: () => api.get('/chats'),
  getMessages: (contactId) => api.get(`/chats/${contactId}/messages`),
  sendMessage: (contactId, body) => api.post('/chats/send', { contactId, body }),
  markAsRead: (contactId) => api.post(`/chats/${contactId}/read`),
};

export default api;
