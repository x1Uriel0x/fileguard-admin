  import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import Icon from "../AppIcon";
  import Button from "./Button";
  import { supabase } from "../../lib/supabase";

  interface HeaderProps {
    onMenuToggle?: () => void;
    showMenuButton?: boolean;
  }

  const Header = ({ onMenuToggle, showMenuButton = true }: HeaderProps) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    const navigate = useNavigate();

    /* -------------------------------------
          Cargar datos del usuario
    -------------------------------------- */
    useEffect(() => {
      const loadUser = async () => {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          // Fetch profile data including avatar_url
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single();

          setUserData({
            ...authData.user,
            user_metadata: {
              ...authData.user.user_metadata,
              avatar_url: profile?.avatar_url || authData.user.user_metadata?.avatar_url,
            },
          });
        }
      };
      loadUser();
    }, []);

    /* -------------------------------------
                 LOGOUT REAL
    -------------------------------------- */
    const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate("/login");
    };

    const userName = userData?.user_metadata?.name || "Usuario";
    const userEmail = userData?.email || "";
    const userRole = userData?.user_metadata?.role || "";

    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-100">
        <div className="flex items-center justify-between h-full pr-4">
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuToggle}
                className="lg:hidden ml-4"
                iconName="Menu"
                iconSize={24}
              />
            )}

            <div className="flex items-center gap-3 pl-4 lg:pl-6">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
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
              <span className="text-xl font-semibold text-foreground hidden sm:inline">
                FileGuard Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* NOTIFICACIONES */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              iconName="Bell"
              iconSize={20}
            >
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            </Button>

            {/* MENÚ DEL USUARIO */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                  {userData?.user_metadata?.avatar_url ? (
                    <img
                      src={userData.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={18} color="white" />
                  )}
                </div>
                <span className="hidden md:inline text-sm font-medium capitalize">
                  {userRole}
                </span>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {/* MENÚ DESPLEGABLE */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-300 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {userName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {userEmail}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-3"
                        onClick={() => {
                          navigate("/profile");
                          setIsUserMenuOpen(false);
                        }}
                      >
                        <Icon name="User" size={16} />
                        <span>Mi Perfil</span>
                      </button>

                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-3"
                        onClick={() => {
                          navigate("/settings");
                          setIsUserMenuOpen(false);
                        }}
                      >
                        <Icon name="Settings" size={16} />
                        <span>Configuración</span>
                      </button>
                    </div>

                    <div className="border-t border-border py-1">
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-error hover:bg-muted flex items-center gap-3"
                        onClick={handleLogout}
                      >
                        <Icon name="LogOut" size={16} />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  };

  export default Header;
