import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (!email) {
      setErrors({ email: 'El correo electrónico es obligatorio' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Por favor, ingrese un correo electrónico válido' });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrors({ general: 'Error al enviar el correo de recuperación. Por favor, intente nuevamente.' });
      } else {
        setSuccess(true);
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
          <title>Correo Enviado - FileGuard</title>
        </Helmet>

        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Mail" size={32} className="text-success" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Correo Enviado
                </h1>
                <p className="text-muted-foreground">
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                </p>
              </div>

              <Button
                onClick={() => navigate('/login')}
                variant="default"
                size="lg"
                fullWidth
              >
                Volver al Inicio de Sesión
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
        <title>Olvidé mi Contraseña - FileGuard</title>
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-8">

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Lock" size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Olvidé mi Contraseña
              </h1>
              <p className="text-muted-foreground">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Correo Electrónico"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
                disabled={isLoading}
                className="w-full"
              />

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
                disabled={isLoading || !email}
                iconName="Mail"
                iconPosition="right"
              >
                Enviar Enlace de Recuperación
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

export default ForgotPassword;
