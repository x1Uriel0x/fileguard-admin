import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SecurityFeatures from './components/SecurityFeatures';
import { supabase } from '../../lib/supabase';
import type { LoginFormData, LoginFormErrors } from './types';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLocked] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleLogin = async (formData: LoginFormData) => {
    if (isLocked) {
      setErrors({
        general: 'Cuenta bloqueada temporalmente. Por favor, intente más tarde.',
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // 🔎 Validaciones básicas
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

      //LOGIN CON SUPABASE
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error || !data.session) {
        setErrors({
          general: 'Credenciales incorrectas. Por favor, intente nuevamente.',
        });
        setIsLoading(false);
        return;
      }

      // Recordarme
      if (formData.rememberMe) {
        localStorage.setItem('fileGuard_email', formData.email);
        localStorage.setItem('fileGuard_rememberMe', 'true');
      }

      localStorage.setItem('fileGuard_isAuthenticated', 'true');

      // OBTENER ROL REAL DESDE PROFILES
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();

      if (profileError || !profile) {
        setErrors({
          general: 'No se pudo obtener el rol del usuario',
        });
        return;
      }

      //REDIRECCIÓN SEGÚN ROL
      if (profile.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/file-upload', { replace: true });
      }

    } catch (error) {
      setErrors({
        general: 'Error al procesar la solicitud. Por favor, intente nuevamente.',
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

            {/* Izquierda */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="hidden lg:block">
                <SecurityFeatures />
              </div>
            </div>

            {/* Derecha */}
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
