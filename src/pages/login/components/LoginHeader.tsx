import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <Icon name="Shield" size={32} color="white" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Bienvenido a FileGuard
        </h1>
        <p className="text-muted-foreground">
          Inicie sesión para acceder al sistema de gestión de archivos
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;