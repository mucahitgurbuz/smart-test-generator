import axios, { AxiosResponse } from 'axios';
import { User, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://jsonplaceholder.typicode.com';
const API_TIMEOUT = 10000;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// User API functions
export const fetchUserById = async (userId: string): Promise<ApiResponse<User>> => {
  try {
    const response: AxiosResponse<User> = await apiClient.get(`/users/${userId}`);

    // Transform the response to match our User interface
    const user: User = {
      id: response.data.id || userId,
      name: response.data.name || 'Unknown User',
      email: response.data.email || 'no-email@example.com',
      role: response.data.role || 'user',
      avatar: response.data.avatar,
      createdAt: response.data.createdAt || new Date().toISOString(),
      updatedAt: response.data.updatedAt || new Date().toISOString(),
      isActive: response.data.isActive ?? true,
      preferences: response.data.preferences || {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    };

    return {
      success: true,
      data: user
    };
  } catch (error) {
    console.error('Failed to fetch user:', error);

    return {
      success: false,
      data: {} as User,
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Unknown error occurred'
    };
  }
};

export const fetchUsers = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<ApiResponse<User[]>> => {
  try {
    const params = new URLSearchParams({
      _page: page.toString(),
      _limit: limit.toString(),
    });

    if (search) {
      params.append('q', search);
    }

    const response = await apiClient.get(`/users?${params}`);

    return {
      success: true,
      data: response.data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        avatar: user.avatar,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
        isActive: user.isActive ?? true,
        preferences: user.preferences || {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      })),
      meta: {
        total: parseInt(response.headers['x-total-count'] || '0'),
        page,
        limit
      }
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to fetch users'
    };
  }
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.post('/users', {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      data: {} as User,
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to create user'
    };
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.put(`/users/${userId}`, {
      ...userData,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      data: {} as User,
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to update user'
    };
  }
};

export const deleteUser = async (userId: string): Promise<ApiResponse<void>> => {
  try {
    await apiClient.delete(`/users/${userId}`);

    return {
      success: true,
      data: undefined
    };
  } catch (error) {
    return {
      success: false,
      data: undefined,
      error: axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Failed to delete user'
    };
  }
};

// Utility function for retry logic
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
};
