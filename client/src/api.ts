const BASE = '/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `请求失败 (${res.status})`);
  }
  return data as T;
}

export const api = {
  get: <T = any>(url: string) => request<T>(url),
  post: <T = any>(url: string, body?: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body || {}) }),
  put: <T = any>(url: string, body?: any) => request<T>(url, { method: 'PUT', body: JSON.stringify(body || {}) }),
  delete: <T = any>(url: string) => request<T>(url, { method: 'DELETE' }),
};

// Auth
export const authApi = {
  register: (data: { username: string; email: string; password: string }) => api.post('/auth/register', data),
  login: (data: { username: string; password: string }) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Courses
export const courseApi = {
  list: () => api.get('/courses'),
  units: (id: number) => api.get(`/courses/${id}/units`),
  lessons: (unitId: number) => api.get(`/courses/units/${unitId}/lessons`),
  lesson: (id: number) => api.get(`/courses/lessons/${id}`),
};

// Vocabulary
export const vocabApi = {
  list: (params?: { level?: string }) => api.get(`/vocabulary${params?.level ? `?level=${params.level}` : ''}`),
  userWords: () => api.get('/vocabulary/user-words'),
  addWord: (word_id: number) => api.post('/vocabulary/user-words', { word_id }),
  removeWord: (wordId: number) => api.delete(`/vocabulary/user-words/${wordId}`),
};

// Grammar
export const grammarApi = {
  list: (params?: { level?: string }) => api.get(`/grammar${params?.level ? `?level=${params.level}` : ''}`),
};

// Listening
export const listeningApi = {
  list: (params?: { level?: string }) => api.get(`/listening${params?.level ? `?level=${params.level}` : ''}`),
  sentences: (params?: { level?: string }) => api.get(`/listening/sentences${params?.level ? `?level=${params.level}` : ''}`),
};

// Progress
export const progressApi = {
  record: (data: any) => api.post('/progress', data),
  stats: () => api.get('/progress/stats'),
  completed: () => api.get('/progress/completed-lessons'),
};

// Recommendations
export const recommendApi = {
  get: () => api.get('/recommendations'),
};

// Community
export const communityApi = {
  list: (category?: string) => api.get(`/posts${category && category !== 'all' ? `?category=${category}` : ''}`),
  detail: (id: number) => api.get(`/posts/${id}`),
  create: (data: { title: string; content: string; category?: string }) => api.post('/posts', data),
  comment: (id: number, content: string) => api.post(`/posts/${id}/comments`, { content }),
  like: (id: number) => api.post(`/posts/${id}/like`),
  liked: (id: number) => api.get(`/posts/${id}/liked`),
};

// Achievements
export const achievementApi = {
  badges: () => api.get('/badges'),
  myBadges: () => api.get('/my-badges'),
  leaderboard: () => api.get('/leaderboard'),
};
