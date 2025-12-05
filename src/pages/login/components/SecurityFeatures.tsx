import Icon from '../../../components/AppIcon';

const SecurityFeatures = () => {
  const features = [
    {
      icon: 'Shield',
      title: 'Autenticación Segura',
      description: 'Protección de datos con cifrado de extremo a extremo'
    },
    {
      icon: 'Lock',
      title: 'Control de Acceso',
      description: 'Permisos basados en roles para máxima seguridad'
    },
    {
      icon: 'FileCheck',
      title: 'Gestión de Archivos',
      description: 'Control granular sobre operaciones de archivos'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          Sistema de Gestión Segura
        </h3>
        <p className="text-sm text-muted-foreground">
          FileGuard proporciona control completo sobre permisos de archivos con seguridad empresarial
        </p>
      </div>
      <div className="space-y-4">
        {features?.map((feature, index) => (
          <div 
            key={index}
            className="flex items-start gap-4 p-4 bg-card/50 border border-border rounded-lg hover:bg-card transition-smooth"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={feature?.icon} size={20} className="text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-medium text-foreground">
                {feature?.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {feature?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={18} className="text-accent flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-xs font-medium text-accent">
              Credenciales de Prueba
            </p>
            <p className="text-xs text-muted-foreground">
              Use las credenciales proporcionadas en la documentación para acceder al sistema de demostración
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityFeatures;