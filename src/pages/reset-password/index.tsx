import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      navigate('/reset-password');
    }
  };

  checkSession();
}, [navigate]);

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (!validatePassword(password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'La confirmación de contraseña es obligatoria';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setErrors({ general: 'Error al actualizar la contraseña. Por favor, intente nuevamente.' });
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setErrors({ general: 'Error al procesar la solicitud. Por favor, intente nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Helmet>
          <title>Contraseña Actualizada - FileGuard</title>
        </Helmet>

        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="CheckCircle" size={32} className="text-success" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Contraseña Actualizada
                </h1>
                <p className="text-muted-foreground">
                  Tu contraseña ha sido cambiada exitosamente.
                </p>
                <p className="text-sm text-muted-foreground">
                  Serás redirigido al inicio de sesión en unos segundos...
                </p>
              </div>

              <Button
                onClick={() => navigate('/login')}
                variant="default"
                size="lg"
                fullWidth
              >
                Ir al Inicio de Sesión
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Restablecer Contraseña - FileGuard</title>
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-8">

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Lock" size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Restablecer Contraseña
              </h1>
              <p className="text-muted-foreground">
                Ingresa tu nueva contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    label="Nueva Contraseña"
                    placeholder="Ingrese su nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirmar Contraseña"
                    placeholder="Confirme su nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    required
                    disabled={isLoading}
                    className="w-full pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-smooth"
                    disabled={isLoading}
                  >
                    <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
                  </button>
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

              <Button
                type="submit"
                variant="default"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={isLoading || !password || !confirmPassword}
                iconName="Save"
                iconPosition="right"
              >
                Actualizar Contraseña
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-primary hover:text-primary/80 transition-smooth font-medium"
                disabled={isLoading}
              >
                ← Volver al Inicio de Sesión
              </button>
            </div>

          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} FileGuard. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
