import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (data) => api.post('/register', data),
  googleLogin: (data = {}) => api.post('/google-login', data),
  getMe: () => api.get('/me'),
};

export const studentService = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getSkillsCatalog: () => api.get('/student/skills'),
  addSkill: (data) => api.post('/student/skills', data),
  addProject: (data) => api.post('/student/projects', data),
  deleteProject: (id) => api.delete(`/student/projects/${id}`),
  addCertification: (data) => api.post('/student/certifications', data),
  deleteCertification: (id) => api.delete(`/student/certifications/${id}`),
};

export const aiService = {
  analyzeProfile: () => api.post('/analyze-profile'),
  getDomainScores: () => api.get('/domain-scores'),
};

export const recommendationService = {
  getRecommendations: (params = {}) => api.get('/recommendations', { params }),
  getSingleRecommendation: (id) => api.get(`/recommendations/${id}`),
  getCareerRoles: () => api.get('/career-roles'),
};

export const skillGapService = {
  getSkillGaps: () => api.get('/skill-gaps'),
};

export const opportunityService = {
  getOpportunities: (params = {}) => api.get('/opportunities', { params }),
  getOpportunity: (id) => api.get(`/opportunities/${id}`),
  createOpportunity: (data) => api.post('/opportunities', data),
  updateOpportunity: (id, data) => api.put(`/opportunities/${id}`, data),
  deleteOpportunity: (id) => api.delete(`/opportunities/${id}`),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getStudents: () => api.get('/admin/students'),
};

export default api;
