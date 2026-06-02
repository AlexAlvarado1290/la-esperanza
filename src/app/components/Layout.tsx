import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Users, Sprout, Handshake, LogOut, Menu, UserCircle, BarChart3, Tag, Scale, MapPin, History } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { api, ApiError } from "../../lib/api";
import { clearSession, useRole } from "../../lib/auth";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const role = useRole();

  // RF03 — Cerrar sesión: avisa al backend (audita el logout) y limpia el JWT
  // local. Si el backend no responde, igual cerramos sesión en el cliente para
  // no dejar al usuario atrapado con un token inválido.
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // 401 / red caída: igual seguimos al cierre local.
      if (!(err instanceof ApiError)) console.warn("logout backend falló", err);
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  };

  let navItems: { name: string; path: string; icon: any }[] = [];

  if (role === 'admin') {
    navItems = [
      { name: "Inicio", path: "/dashboard", icon: LayoutDashboard },
      { name: "Usuarios", path: "/users", icon: Users },
      { name: "Productos", path: "/products", icon: Sprout },
      { name: "Acuerdos", path: "/agreements", icon: Handshake },
      { name: "Categorías", path: "/categories", icon: Tag },
      { name: "Unidades", path: "/units", icon: Scale },
      { name: "Puntos Entrega", path: "/delivery-points", icon: MapPin },
      { name: "Reportes", path: "/reports", icon: BarChart3 },
    ];
  } else if (role === 'producer') {
    navItems = [
      { name: "Inicio", path: "/dashboard", icon: LayoutDashboard },
      { name: "Mis Productos", path: "/products", icon: Sprout },
      { name: "Acuerdos", path: "/agreements", icon: Handshake },
      { name: "Historial", path: "/sales-history", icon: History },
      { name: "Mi Perfil", path: "/profile", icon: UserCircle },
    ];
  } else if (role === 'buyer') {
    navItems = [
      { name: "Inicio", path: "/dashboard", icon: LayoutDashboard },
      { name: "Catálogo", path: "/products", icon: Sprout },
      { name: "Mis Compras", path: "/agreements", icon: Handshake },
      { name: "Mi Perfil", path: "/profile", icon: UserCircle },
    ];
  } else {
    // guest
    navItems = [
      { name: "Catálogo", path: "/products", icon: Sprout },
    ];
  }

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-green-800 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sprout className="w-8 h-8" />
            La Esperanza
          </h1>
          <p className="text-green-200 text-sm mt-1">Comunidad Agrícola</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-lg",
                  isActive ? "bg-green-700 font-medium" : "hover:bg-green-700/50 text-green-50"
                )}
              >
                <Icon className="w-6 h-6" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-700/50 transition-colors text-lg text-green-100 w-full text-left"
          >
            <LogOut className="w-6 h-6" />
            Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-green-800 text-white shadow-md z-10">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sprout className="w-6 h-6" />
            La Esperanza
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-green-700 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-green-800 text-white z-20 shadow-lg border-t border-green-700">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-lg",
                      isActive ? "bg-green-700 font-medium" : "hover:bg-green-700/50 text-green-50"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-700/50 text-lg text-green-100 mt-4 border-t border-green-700/50 w-full text-left"
              >
                <LogOut className="w-6 h-6" />
                Cerrar Sesión
              </button>
            </nav>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-5xl mx-auto pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 pb-safe z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl min-w-[60px]",
                isActive ? "text-green-700" : "text-gray-500 hover:text-green-600"
              )}
            >
              <div className={cn("p-1.5 rounded-full mb-1", isActive && "bg-green-100")}>
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
