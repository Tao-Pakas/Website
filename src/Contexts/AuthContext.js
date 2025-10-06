// services/auth.js
import axios from 'axios';

const API_URL = 'http://localhost:1337/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Register - Strapi v5 expects different field names
  async register(userData) {
    try {
      const response = await api.post('/auth/local/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        // Remove fullName if not in your Strapi user model
        // fullName: userData.fullName,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || error;
    }
  },

  // Login
  async login(identifier, password) {
    try {
      const response = await api.post('/auth/local', {
        identifier, // email or username
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || error;
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || error;
    }
  },

  // Reset password
  async resetPassword(code, password, passwordConfirmation) {
    try {
      const response = await api.post('/auth/reset-password', {
        code,
        password,
        passwordConfirmation,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || error;
    }
  },

  // Get current user - Strapi v5 endpoint
  async getMe() {
    try {
      const response = await api.get('/users/me?populate=*');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || error;
    }
  },
};