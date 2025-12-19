import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

interface SidebarProps {
  isCollapsed?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  isAdmin: boolean; // 👈 NUEVO
}


interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  description?: string;
  adminOnly?: boolean;
}

const Sidebar = ({
  isCollapsed = false,
  isOpen = false,
  onClose,
  isAdmin,
}: SidebarProps) => {

  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navigationItems: NavigationItem[] = [
    {
      label: 'Panel de Control',
      path: '/admin-dashboard',
      icon: 'LayoutDashboard',
      description: 'Vista general del sistema',
      adminOnly: true,
    },
    {
      label: 'Gestión de Permisos',
      path: '/permission-management',
      icon: 'Shield',
      description: 'Administrar permisos de usuarios',
      adminOnly: true,
    },
    {
      label: 'Subir Archivos',
      path: '/file-upload',
      icon: 'Upload',
      description: 'Cargar y gestionar archivos',
    },
  ];

  const filteredNavigationItems = navigationItems.filter(item => !item.adminOnly || isAdmin);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* OVERLAY SOLO PARA MÓVIL */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[150] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:fixed
          top-16
          left-0 bottom-0
          bg-card border-r border-border
          transition-all duration-300
          z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-16" : "w-64"}
        `}
      >

        <nav className="flex-1 overflow-y-auto p-6 md:p-10">
          {/* Items */}
          <div className="flex-1 px-3 space-y-1 overflow-y-auto">
            {filteredNavigationItems.map((item) => {
              const active = isActive(item.path);
              const showTooltip = hoveredItem === item.path && isCollapsed;

              return (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                      transition-smooth relative
                      ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-muted"
                      }
                      ${isCollapsed ? "justify-center" : ""}
                    `}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                      className={`flex-shrink-0 ${
                        active
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    />

                    {!isCollapsed && (
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{item.label}</div>
                        {item.description && !active && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>
                    )}

                    {active && !isCollapsed && (
                      <div className="w-1 h-6 bg-primary-foreground rounded-full absolute right-2" />
                    )}
                  </button>

                  {/* Tooltip cuando colapsado */}
                  {showTooltip && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-[300] pointer-events-none">
                      <div className="bg-popover border border-border rounded-md shadow-lg px-3 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-3 pt-4 border-t border-border">
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "sm"}
              className="w-full justify-start"
              iconName="HelpCircle"
              iconSize={20}
              onClick={() => console.log("Help clicked")}
            >
              {!isCollapsed && <span className="ml-3">Ayuda y Soporte</span>}
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
