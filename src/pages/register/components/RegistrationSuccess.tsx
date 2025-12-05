import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

interface RegistrationSuccessProps {
  email: string;
}

const RegistrationSuccess = ({ email }: RegistrationSuccessProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <Icon name="CheckCircle2" size={40} color="var(--color-success)" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          ¡Registro Exitoso!
        </h2>
        <p className="text-muted-foreground">
          Tu cuenta ha sido creada correctamente
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Icon name="Mail" size={16} className="text-primary" />
          <span className="text-foreground font-medium">{email}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Hemos enviado un correo de verificación a esta dirección
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Por favor, revisa tu bandeja de entrada y verifica tu correo electrónico
          para activar tu cuenta y acceder al sistema.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Icon name="Info" size={14} />
          <span>El enlace de verificación expirará en 24 horas</span>
        </div>
      </div>

      <div className="pt-4">
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={() => navigate('/login')}
          iconName="ArrowRight"
          iconPosition="right"
        >
          Ir a Iniciar Sesión
        </Button>
      </div>
    </div>
  );
};

export default RegistrationSuccess;