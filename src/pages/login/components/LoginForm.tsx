import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import type { LoginFormData, LoginFormErrors, MockCredentials } from '../types';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
  errors: LoginFormErrors;
}

const MOCK_CREDENTIALS: MockCredentials[] = [
  {
    email: "admin@fileguard.com",
    password: "Admin@2024",
    role: "admin",
    name: "Administrador Principal"
  },
  {
    email: "usuario@fileguard.com",
    password: "Usuario@2024",
    role: "user",
    name: "Usuario Estándar"
  }
];

const LoginForm = ({ onSubmit, isLoading, errors }: LoginFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'password' && typeof value === 'string') {
      evaluatePasswordStrength(value);
    }
  };

  const evaluatePasswordStrength = (password: string) => {
    if (password.length === 0) {
      setPasswordStrength(null);
      return;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough]
      .filter(Boolean).length;

    if (strengthScore <= 2) setPasswordStrength('weak');
    else if (strengthScore <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-error';
      case 'medium': return 'bg-warning';
      case 'strong': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Débil';
      case 'medium': return 'Media';
      case 'strong': return 'Fuerte';
      default: return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          type="email"
          label="Correo Electrónico"
          placeholder="correo@ejemplo.com"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={errors.email}
          required
          disabled={isLoading}
          className="w-full"
        />

        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="Ingrese su contraseña"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              required
              disabled={isLoading}
              className="w-full pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-smooth"
              disabled={isLoading}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>

          {passwordStrength && formData.password.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fortaleza de contraseña:</span>
                <span className={`font-medium ${
                  passwordStrength === 'weak' ? 'text-error' :
                  passwordStrength === 'medium'? 'text-warning' : 'text-success'
                }`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                  style={{ 
                    width: passwordStrength === 'weak' ? '33%' : 
                           passwordStrength === 'medium' ? '66%' : '100%' 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {errors.general && (
        <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-md">
          <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-error font-medium">{errors.general}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Checkbox
          label="Recordarme"
          checked={formData.rememberMe}
          onChange={handleInputChange('rememberMe')}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-sm text-primary hover:text-primary/80 transition-smooth font-medium"
          disabled={isLoading}
        >
          ¿Olvidó su contraseña?
        </button>
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        disabled={isLoading || !formData.email || !formData.password}
        iconName="LogIn"
        iconPosition="right"
      >
        Iniciar Sesión
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ¿No tiene una cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-primary hover:text-primary/80 transition-smooth font-medium"
            disabled={isLoading}
          >
            Registrarse
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;