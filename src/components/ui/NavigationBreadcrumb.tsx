import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

interface BreadcrumbItem {
  label: string;
  path: string;
}
interface NavigationBreadcrumbProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}
interface NavigationBreadcrumbProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

const NavigationBreadcrumb = ({ customItems, className = '' }: NavigationBreadcrumbProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map de rutas -> nombres bonitos
  const routeLabels: Record<string, string> = {
    '/admin-dashboard': 'Panel de Control',
    '/permission-management': 'Gestión de Permisos',
    '/login': 'Iniciar Sesión',
    '/register': 'Registrarse',
    '/file-upload': 'Mis Archivos',
    '/settings': 'Configuración',
    '/profile': 'Mi Perfil',
  };
  
  // Función que genera breadcrumbs automáticamente o usa los personalizados
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Inicio', path: '/admin-dashboard' },
    ];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label =
        routeLabels[currentPath] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      className={`flex items-center gap-2 text-sm overflow-x-auto ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={item.path} className="flex items-center gap-2 flex-shrink-0">
            {index > 0 && (
              <Icon
                name="ChevronRight"
                size={16}
                className="text-muted-foreground flex-shrink-0"
              />
            )}

            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <button
                onClick={() => navigate(item.path)}
                className="text-muted-foreground hover:text-foreground transition-smooth"
              >
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default NavigationBreadcrumb;
