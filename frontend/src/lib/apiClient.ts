import { STORAGE_KEYS } from './constants';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const getHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.JWT);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    }
  });

  if (!response.ok) {
    let errorMsg = `API error: ${response.status}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) {
        errorMsg = errData.error;
      }
    } catch (e) {}

    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication token expired or invalid');
      localStorage.removeItem(STORAGE_KEYS.JWT);
    }

    throw new ApiError(errorMsg, response.status);
  }

  return response.json();
}
