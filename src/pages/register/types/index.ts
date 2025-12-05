export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  role: 'admin' | 'user';
  acceptTerms: boolean;
}

export interface Department {
  value: string;
  label: string;
  description?: string;
}

export interface Role {
  value: 'admin' | 'user';
  label: string;
  description: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  department?: string;
  role?: string;
  acceptTerms?: string;
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}