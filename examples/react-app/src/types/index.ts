export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  userId: string;
}

export interface SearchFilters {
  query: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}
