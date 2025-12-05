import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SecurityFeatures from './components/SecurityFeatures';
import type { LoginFormData, LoginFormErrors, MockCredentials, AuthResponse } from './types';

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

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const authenticateUser = (email: string, password: string): AuthResponse | null => {
    const user = MOCK_CREDENTIALS.find(
      cred => cred.email === email && cred.password === password
    );

    if (user) {
      return {
        success: true,
        role: user.role,
        token: `mock_token_${Date.now()}`,
        message: `Bienvenido, ${user.name}`
      };
    }

    return null;
  };

  const handleLogin = async (formData: LoginFormData) => {
    if (isLocked) {
      setErrors({
        general: 'Cuenta bloqueada temporalmente. Por favor, intente más tarde.'
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newErrors: LoginFormErrors = {};

      if (!formData.email) {
        newErrors.email = 'El correo electrónico es obligatorio';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Por favor, ingrese un correo electrónico válido';
      }

      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (!validatePassword(formData.password)) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      const authResponse = authenticateUser(formData.email, formData.password);

      if (!authResponse) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 3) {
          setIsLocked(true);
          setErrors({
            general: 'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.'
          });
          setTimeout(() => {
            setIsLocked(false);
            setLoginAttempts(0);
          }, 900000);
        } else {
          const validCredentials = MOCK_CREDENTIALS.map(
            cred => `${cred.email} / ${cred.password}`
          ).join(' o ');
          
          setErrors({
            general: `Credenciales incorrectas. Intento ${newAttempts} de 3. Use: ${validCredentials}`
          });
        }
        setIsLoading(false);
        return;
      }

      if (formData.rememberMe) {
        localStorage.setItem('fileGuard_rememberMe', 'true');
        localStorage.setItem('fileGuard_email', formData.email);
      }

      localStorage.setItem('fileGuard_token', authResponse.token);
      localStorage.setItem('fileGuard_role', authResponse.role);
      localStorage.setItem('fileGuard_isAuthenticated', 'true');

      setLoginAttempts(0);

      setTimeout(() => {
        if (authResponse.role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          navigate('/admin-dashboard', { replace: true });
        }
      }, 500);

    } catch (error) {
      setErrors({
        general: 'Error al procesar la solicitud. Por favor, intente nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión - FileGuard Admin</title>
        <meta 
          name="description" 
          content="Acceda al sistema de gestión de archivos FileGuard con autenticación segura y control basado en roles" 
        />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="flex flex-col justify-center space-y-8">
              <div className="hidden lg:block">
                <SecurityFeatures />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-8">
                  <LoginHeader />
                  
                  <LoginForm 
                    onSubmit={handleLogin}
                    isLoading={isLoading}
                    errors={errors}
                  />

                  <div className="lg:hidden pt-6 border-t border-border">
                    <SecurityFeatures />
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} FileGuard. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;