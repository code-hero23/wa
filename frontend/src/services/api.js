import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5150/api',
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
  getEmployees: () => api.get('/auth/employees'),
  registerEmployee: (data) => api.post('/auth/employees', data),
  deleteEmployee: (id) => api.delete(`/auth/employees/${id}`),
};

export const campaignService = {
  create: (data) => api.post('/campaigns/send', data),
  getAll: () => api.get('/campaigns'),
  getTemplates: () => api.get('/campaigns/templates'),
};

export const emailService = {
  createCampaign: (data) => api.post('/email/campaigns', data),
  getCampaigns: () => api.get('/email/campaigns'),
  getCampaignStats: (id) => api.get(`/email/campaigns/${id}`),
  getTemplates: () => api.get('/email/templates'),
  createTemplate: (data) => api.post('/email/templates', data),
  updateTemplate: (id, data) => api.put(`/email/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/email/templates/${id}`),
  getSmtp: () => api.get('/email/smtp'),
  updateSmtp: (data) => api.post('/email/smtp', data),
  testSendEmail: (to) => api.post('/email/test-send', { to }),
};

export const contactService = {
  getAll: (params) => api.get('/contacts', { params }),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  import: (formData) => api.post('/contacts/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const messageService = {
  getAll: () => api.get('/campaigns/messages'),
};

export const chatService = {
  getChats: (params) => api.get('/chats', { params }),
  getMessages: (contactId) => api.get(`/chats/${contactId}/messages`),
  sendMessage: (contactId, body) => api.post('/chats/send', { contactId, body }),
  markAsRead: (contactId) => api.post(`/chats/${contactId}/read`),
};

export default api;
