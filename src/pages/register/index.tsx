import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import Icon from '../../components/AppIcon';
import PasswordStrengthIndicator from './components/PasswordStrengthIndicator';
import RoleSelectionCard from './components/RoleSelectionCard';
import DepartmentSelector from './components/DepartmentSelector';
import { supabase } from "../../lib/supabase";

import RegistrationSuccess from './components/RegistrationSuccess';
import type {
  RegisterFormData,
  ValidationErrors,
  PasswordStrength,
  Department,
  Role,
} from './types';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'user',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Muy débil',
    color: 'text-error',
    requirements: {
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    },
  });

  const departments: Department[] = [
    { value: 'it', label: 'Tecnología de la Información', description: 'Desarrollo y soporte técnico' },
    { value: 'hr', label: 'Recursos Humanos', description: 'Gestión de personal' },
    {value: 'manager', label:'Gerente', description:'Propietario' },
    { value: 'finance', label: 'Finanzas', description: 'Contabilidad y presupuestos' },
    { value: 'operations', label: 'Operaciones', description: 'Gestión operativa' },
    { value: 'marketing', label: 'Marketing', description: 'Comunicación y ventas' },
    { value: 'legal', label: 'Legal', description: 'Asuntos legales y cumplimiento' },
  ];

  const roles: Role[] = [
    {
      value: 'user',
      label: 'Usuario Estándar',
      description: 'Acceso a archivos asignados con permisos de visualización y edición según configuración',
    },
    {
      value: 'admin',
      label: 'Administrador',
      description: 'Control completo sobre usuarios, permisos y acceso a todos los archivos del sistema',
    },
  ];

 /* const mockExistingEmails = [
    'admin@fileguard.com',
    'user@fileguard.com',
    'test@example.com',
  ];*/

  


  useEffect(() => {
    calculatePasswordStrength(formData.password);
  }, [formData.password]);

  const calculatePasswordStrength = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;

    let label = 'Muy débil';
    let color = 'text-error';

    if (score === 5) {
      label = 'Muy fuerte';
      color = 'text-success';
    } else if (score === 4) {
      label = 'Fuerte';
      color = 'text-success';
    } else if (score === 3) {
      label = 'Media';
      color = 'text-warning';
    } else if (score === 2) {
      label = 'Débil';
      color = 'text-warning';
    }

    setPasswordStrength({ score, label, color, requirements });
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Formato de correo electrónico inválido';
    } 

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (passwordStrength.score < 4) {
      newErrors.password = 'La contraseña no cumple con los requisitos mínimos de seguridad';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar su contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.department) {
      newErrors.department = 'Debe seleccionar un departamento';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debe aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setIsLoading(true);

try {
  // Crear usuario en Auth
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    setErrors({ email: error.message });
    setIsLoading(false);
    return;
  }

  const user = data.user;
  console.log("Nuevo usuario:", user);

  // Insertar registro en la tabla PROFILES
  if (user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,               
      name: formData.name,
      role: "user",          
      avatar_url: null,
    });

    if (profileError) {
      console.error("Error creando profile:", profileError);
    }
  }
  setRegistrationComplete(true);

} catch (error) {
  console.error("Registration error:", error);
  setErrors({
    email: "Error al crear la cuenta. Por favor, intente nuevamente.",
  });
} finally {
  setIsLoading(false);
}
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl shadow-lg p-8">
            <RegistrationSuccess email={formData.email} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="32" height="32" rx="6" fill="var(--color-primary)" />
                <path
                  d="M16 8L9 12V20L16 24L23 20V12L16 8Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 16L23 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 16V24"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 16L9 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h1 className="text-3xl font-bold text-foreground">FileGuard Admin</h1>
            </div>
            <p className="text-muted-foreground">
              Crea tu cuenta para acceder al sistema de gestión de archivos
            </p>
          </div>

          <div className="bg-card rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Nombre Completo"
                    type="text"
                    placeholder="Ingrese su nombre completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Correo Electrónico"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    description="Usaremos este correo para la verificación de cuenta"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingrese su contraseña"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    error={errors.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
                  </button>
                  {formData.password && (
                    <div className="mt-3">
                      <PasswordStrengthIndicator strength={passwordStrength} />
                    </div>
                  )}
                </div>

                <div>
                  <Input
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme su contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
                  </button>
                </div>

                <div className="md:col-span-2">
                  <DepartmentSelector
                    value={formData.department}
                    onChange={(value) => handleInputChange('department', value)}
                    error={errors.department}
                    departments={departments}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Tipo de Cuenta <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role) => (
                      <RoleSelectionCard
                        key={role.value}
                        role={role}
                        selected={formData.role === role.value}
                        onClick={() => handleInputChange('role', role.value)}
                      />
                    ))}
                  </div>
                  {errors.role && (
                    <p className="text-sm text-error mt-2">{errors.role}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Checkbox
                    label="Acepto los términos y condiciones"
                    description="He leído y acepto la política de privacidad y los términos de uso del sistema"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                    error={errors.acceptTerms}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  iconName="UserPlus"
                  iconPosition="left"
                >
                  Crear Cuenta
                </Button>

                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
              <br />
              Todos los datos están protegidos con cifrado de extremo a extremo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
