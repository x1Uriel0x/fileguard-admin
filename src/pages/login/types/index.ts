export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface AuthResponse {
  success: boolean;
  role: 'admin' | 'user';
  token: string;
  message?: string;
}

export interface MockCredentials {
  email: string;
  password: string;
  role: 'admin' | 'user';
  name: string;
}