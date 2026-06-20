// Pratibha AI — Centralized API client
// All backend communication goes through this module

const API_BASE = '/api';

let authToken: string | null = localStorage.getItem('pratibha_auth_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('pratibha_auth_token', token);
  } else {
    localStorage.removeItem('pratibha_auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ========== Auth API ==========
export interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  anganwadiBlock: string;
  language: string;
}

export interface LoginResponse {
  token: string;
  worker: WorkerProfile;
}

export const authApi = {
  login: (phone: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),

  getProfile: () => request<WorkerProfile>('/auth/me'),

  updateProfile: (data: Partial<{ name: string; anganwadiBlock: string; language: string }>) =>
    request<WorkerProfile>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ========== Children API ==========
export interface Observation {
  id: string;
  date: string;
  note: string;
  category: string;
  type: 'voice' | 'text' | 'photo';
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  category: string;
  completed: boolean;
}

export interface Child {
  id: string;
  name: string;
  nameHindi: string;
  age: number;
  ageDisplay: string;
  gender: 'boy' | 'girl';
  avatar: string;
  attendance: 'present' | 'absent' | 'irregular';
  nutritionStatus: 'good' | 'at-risk' | 'monitoring';
  developmentProgress: number;
  lastVisit: string;
  parentName: string;
  parentPhone: string;
  address: string;
  observations: Observation[];
  milestones: Milestone[];
  aiInsights: string[];
  needsAttention: boolean;
  attendanceHistory: boolean[];
}

export const childrenApi = {
  getAll: () => request<Child[]>('/children'),

  getById: (id: string) => request<Child>(`/children/${id}`),

  add: (data: Partial<Child>) =>
    request<{ id: string; name: string }>('/children', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  toggleAttendance: (id: string, attendance?: string) =>
    request<{ id: string; name: string; attendance: string }>(`/children/${id}/attendance`, {
      method: 'PUT',
      body: JSON.stringify({ attendance }),
    }),

  markAllPresent: () =>
    request<{ message: string; count: number }>('/children/mark-all-present', {
      method: 'POST',
    }),

  addObservation: (childId: string, note: string, category: string, type?: string) =>
    request<Observation & { childName: string }>(`/children/${childId}/observations`, {
      method: 'POST',
      body: JSON.stringify({ note, category, type }),
    }),

  updateMilestone: (childId: string, milestoneId: string, completed: boolean) =>
    request<Milestone>(`/children/${childId}/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify({ completed }),
    }),
};

// ========== Activities API ==========
export interface Activity {
  id: string;
  title: string;
  titleHindi: string;
  category: string;
  ageGroup: string;
  duration: string;
  materials: string[];
  learningOutcome: string;
  icon: string;
  aiRecommended?: boolean;
}

export const activitiesApi = {
  getAll: () => request<Activity[]>('/activities'),
  getRecommended: () => request<Activity[]>('/activities/recommended'),
};

// ========== Home Visits API ==========
export interface HomeVisit {
  id: string;
  childName: string;
  parentName: string;
  concern: string;
  lastVisit: string;
  suggestedTopics: string[];
  status: 'pending' | 'completed';
}

export const visitsApi = {
  getAll: () => request<HomeVisit[]>('/visits'),

  create: (data: { childName: string; parentName?: string; concern?: string; lastVisit?: string }) =>
    request<HomeVisit>('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  complete: (id: string) =>
    request<{ id: string; childName: string; status: string }>(`/visits/${id}/complete`, {
      method: 'PUT',
    }),
};

// ========== Notifications API ==========
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'reminder' | 'success' | 'info';
  time: string;
  read: boolean;
  action?: string;
}

export const notificationsApi = {
  getAll: () => request<AppNotification[]>('/notifications'),

  markRead: (id: string) =>
    request<{ id: string; read: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllRead: () =>
    request<{ message: string }>('/notifications/read-all', {
      method: 'PUT',
    }),

  clearAll: () =>
    request<{ message: string }>('/notifications', {
      method: 'DELETE',
    }),
};

// ========== Reports API ==========
export interface DashboardStats {
  totalChildren: number;
  attendance: { present: number; absent: number; irregular: number; percent: number };
  nutrition: { good: number; monitoring: number; atRisk: number };
  needsAttentionCount: number;
  totalObservations: number;
  totalMilestonesCompleted: number;
  visits: { pending: number; completed: number };
  unreadNotifications: number;
  averageDevelopmentProgress: number;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  summary: string;
  data: any;
}

export interface ImpactData {
  timeSaved: number;
  timeSavedPrevious: number;
  paperworkReduced: number;
  childEngagement: number;
  attendanceImprovement: number;
  activitiesCompleted: number;
  homeVisitsCompleted: number;
  observationsLogged: number;
  weeklyImprovement: { week: string; engagement: number; attendance: number }[];
}

export const reportsApi = {
  getAll: () => request<Report[]>('/reports'),
  getDashboard: () => request<DashboardStats>('/reports/dashboard'),
  getImpact: () => request<ImpactData>('/reports/impact'),
};

// ========== Chat API ==========
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export const chatApi = {
  getHistory: () => request<ChatMessage[]>('/chat/history'),

  sendMessage: (message: string) =>
    request<{ userMessage: ChatMessage; aiMessage: ChatMessage }>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  clearHistory: () =>
    request<{ message: string }>('/chat/history', {
      method: 'DELETE',
    }),
};

// ========== Voice Report API ==========
export interface VoiceReportItem {
  childName: string;
  note: string;
  type: 'observation' | 'alert';
}

export const voiceReportApi = {
  save: (items: VoiceReportItem[]) =>
    request<{ message: string; results: { childName: string; observationId: string; status: string }[] }>('/voice-report/save', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
};

// ========== Admin API ==========
export const adminApi = {
  resetDatabase: () =>
    request<{ message: string }>('/admin/reset', {
      method: 'POST',
    }),
};
