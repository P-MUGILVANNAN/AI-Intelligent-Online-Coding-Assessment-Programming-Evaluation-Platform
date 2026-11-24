import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for token insertion
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refresh_token: refreshToken });
          localStorage.setItem('access_token', res.data.access_token);
          localStorage.setItem('refresh_token', res.data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const downloadBlobFile = async (url: string, defaultFilename: string) => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const contentType = response.headers['content-type'];
    const blob = new Blob([response.data], {
      type: typeof contentType === 'string' ? contentType : 'application/octet-stream',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err: any) {
    console.error('File download failed:', err);
    alert('Failed to download file. Please verify network connection.');
  }
};

export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: (refreshToken: string) => api.post('/auth/logout', { refresh_token: refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

export const usersAPI = {
  list: (params?: any) => api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  roles: () => api.get('/users/roles'),
  institutions: () => api.get('/users/institutions'),
  createInstitution: (data: any) => api.post('/users/institutions', data),
};

export const questionsAPI = {
  list: (params?: any) => api.get('/questions', { params }),
  get: (id: string) => api.get(`/questions/${id}`),
  create: (data: any) => api.post('/questions', data),
  update: (id: string, data: any) => api.put(`/questions/${id}`, data),
  delete: (id: string) => api.delete(`/questions/${id}`),
  addTestCase: (questionId: string, data: any) => api.post(`/questions/${questionId}/test-cases`, data),
  deleteTestCase: (testCaseId: string) => api.delete(`/questions/test-cases/${testCaseId}`),
};

export const assessmentsAPI = {
  list: (params?: any) => api.get('/assessments', { params }),
  get: (id: string) => api.get(`/assessments/${id}`),
  create: (data: any) => api.post('/assessments', data),
  update: (id: string, data: any) => api.put(`/assessments/${id}`, data),
  delete: (id: string) => api.delete(`/assessments/${id}`),
  startSession: (id: string) => api.post(`/assessments/${id}/start`),
  getSession: (id: string) => api.get(`/assessments/${id}/session`),
  finishSession: (id: string) => api.post(`/assessments/${id}/finish`),
  logViolation: (id: string) => api.post(`/assessments/${id}/violation`),
  getParticipants: (id: string) => api.get(`/assessments/${id}/participants`),
};

export const codeAPI = {
  run: (data: { source_code: string; programming_language: string; question_id: string; custom_input?: string }) =>
    api.post('/code/run', data),
  submit: (data: { source_code: string; programming_language: string; question_id: string; assessment_id?: string }) =>
    api.post('/code/submit', data),
};

export const submissionsAPI = {
  list: (params?: any) => api.get('/submissions', { params }),
  get: (id: string) => api.get(`/submissions/${id}`),
  results: (id: string) => api.get(`/submissions/${id}/results`),
};

export const plagiarismAPI = {
  analyze: (data: { assessment_id?: string; question_id?: string; similarity_threshold?: number }) =>
    api.post('/plagiarism/analyze', data),
  reports: (params?: any) => api.get('/plagiarism/reports', { params }),
  getReport: (id: string) => api.get(`/plagiarism/reports/${id}`),
  review: (id: string, data: { review_status: string; reviewer_notes?: string }) =>
    api.put(`/plagiarism/reports/${id}/review`, data),
};

export const analyticsAPI = {
  admin: () => api.get('/analytics/admin'),
  instructor: () => api.get('/analytics/instructor'),
  student: () => api.get('/analytics/student'),
};

export const reportsAPI = {
  assessment: (id: string) => api.get(`/reports/assessment/${id}`),
  exportCsvUrl: (id: string) => {
    const token = localStorage.getItem('access_token');
    return `/api/reports/export/${id}${token ? `?token=${token}` : ''}`;
  },
  studentPdfUrl: (studentId: string, assessmentId?: string) => {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    if (assessmentId) params.append('assessment_id', assessmentId);
    if (token) params.append('token', token);
    const qs = params.toString();
    return `/api/reports/student/${studentId}/pdf${qs ? `?${qs}` : ''}`;
  },
  downloadPdf: (studentId: string, assessmentId?: string) => {
    const url = `/reports/student/${studentId}/pdf${assessmentId ? `?assessment_id=${assessmentId}` : ''}`;
    return downloadBlobFile(url, `codeeval_report_${studentId}.pdf`);
  },
  downloadCsv: (assessmentId: string) => {
    const url = `/reports/export/${assessmentId}`;
    return downloadBlobFile(url, `assessment_${assessmentId}_report.csv`);
  },
};

export const notificationsAPI = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export default api;
