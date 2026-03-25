import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

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
