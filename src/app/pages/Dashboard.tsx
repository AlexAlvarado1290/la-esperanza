import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Users, Sprout, Handshake, Truck, TrendingUp, AlertCircle, BarChart3, XCircle } from "lucide-react";
import { Card, CardContent, Button } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import { useAuth, useRole } from "../../lib/auth";
import type { Acuerdo, Producto, Solicitud } from "../../lib/types";

interface AdminKpis {
  productoresActivos: number;
  compradoresActivos: number;
  productosPublicados: number;
  solicitudesEnRango: number;
  entregasCompletadas: number;
  entregasCanceladas: number;
  incidenciasTotales: number;
}

export function Dashboard() {
  const role = useRole();
  const { user } = useAuth();
  const [adminKpis, setAdminKpis] = useState<AdminKpis | null>(null);
  const [producerStats, setProducerStats] = useState<{ products: number; newRequests: number } | null>(null);
  const [buyerStats, setBuyerStats] = useState<{ activos: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "guest") {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        if (role === "admin") {
          const r = await api.get<{ kpis: AdminKpis }>("/reports/general");
          setAdminKpis(r.kpis);
        } else if (role === "producer") {
          const [mine, requests] = await Promise.all([
            api.get<{ items: Producto[] }>("/products/mine"),
            api.get<Solicitud[]>("/requests", { query: { estado: "SOLICITADO" } }),
          ]);
          setProducerStats({ products: mine.items.length, newRequests: requests.length });
        } else if (role === "buyer") {
          const acuerdos = await api.get<Acuerdo[]>("/agreements");
          const activos = acuerdos.filter((a) =>
            ["ACEPTADO", "PREPARANDO", "PROGRAMADO", "EN_RUTA", "ENTREGADO_PRODUCTOR"].includes(a.estadoAcuerdo),
          ).length;
          setBuyerStats({ activos });
        }
      } catch (e) {
        // silent: dashboard se degrada elegante con valores vacíos
        if (!(e instanceof ApiError)) console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [role, user?.idUsuario]);

  if (role === "guest") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in duration-300">
        <Sprout className="w-20 h-20 text-green-200" />
        <h1 className="text-3xl font-extrabold text-gray-900">Bienvenido a La Esperanza</h1>
        <p className="text-xl text-gray-600 max-w-md">Para realizar compras, solicita una cuenta a la Asociación.</p>
        <Link to="/products">
          <Button size="lg" className="h-14 px-8 text-lg mt-4">Ver Catálogo de Productos</Button>
        </Link>
        <Link to="/login">
          <Button variant="outline" size="lg" className="h-14 px-8 text-lg">Iniciar Sesión</Button>
        </Link>
      </div>
    );
  }

  if (role === "buyer") {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Bienvenido{user ? `, ${user.nombreCompleto.split(" ")[0]}` : ""}</h1>
          <p className="text-gray-500 text-lg mt-2">Encuentra los mejores productos agrícolas.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <Link to="/products" className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-green-500 active:scale-[0.98] transition-all">
            <div className="bg-green-100 p-4 rounded-full text-green-700"><Sprout className="w-8 h-8" /></div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">Catálogo de Productos</p>
              <p className="text-gray-500 text-lg">Explorar y solicitar productos</p>
            </div>
          </Link>
          <Link to="/agreements" className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-orange-500 active:scale-[0.98] transition-all">
            <div className="bg-orange-100 p-4 rounded-full text-orange-700"><Handshake className="w-8 h-8" /></div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">Mis Compras{buyerStats ? ` (${buyerStats.activos} activas)` : ""}</p>
              <p className="text-gray-500 text-lg">Ver el estado de mis compras</p>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  if (role === "producer") {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Mi Panel</h1>
          <p className="text-gray-500 text-lg mt-2">Gestione sus productos y ventas</p>
        </header>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <Link to="/products">
            <Card className="hover:border-green-600 hover:shadow-md transition-all h-full cursor-pointer border-transparent shadow-sm">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3 h-full">
                <div className="p-4 rounded-2xl bg-green-100 text-green-600 mb-2"><Sprout className="w-8 h-8" /></div>
                <h3 className="text-4xl font-black text-gray-900">{loading ? "…" : producerStats?.products ?? 0}</h3>
                <p className="text-gray-600 font-medium leading-tight">Mis Productos</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/agreements">
            <Card className="hover:border-orange-600 hover:shadow-md transition-all h-full cursor-pointer border-transparent shadow-sm">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3 h-full">
                <div className="p-4 rounded-2xl bg-orange-100 text-orange-600 mb-2"><AlertCircle className="w-8 h-8" /></div>
                <h3 className="text-4xl font-black text-gray-900">{loading ? "…" : producerStats?.newRequests ?? 0}</h3>
                <p className="text-gray-600 font-medium leading-tight">Solicitudes Nuevas</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-green-600" /> Acciones Rápidas
          </h2>
          <div className="grid gap-4">
            <Link to="/products/new" className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-green-500 active:scale-[0.98] transition-all">
              <div className="bg-green-100 p-3 rounded-full text-green-700"><Sprout className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-900">Registrar Nuevo Producto</p>
                <p className="text-gray-500">Añadir una nueva cosecha al catálogo</p>
              </div>
            </Link>
            <Link to="/agreements" className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-orange-500 active:scale-[0.98] transition-all">
              <div className="bg-orange-100 p-3 rounded-full text-orange-700"><Handshake className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className="text-xl font-bold text-gray-900">Ver Solicitudes Recibidas</p>
                <p className="text-gray-500">Revisar compras pendientes de aprobación</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin
  const kpis = [
    { title: "Productores Activos", value: adminKpis?.productoresActivos ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100", path: "/users?tab=productor" },
    { title: "Compradores Activos", value: adminKpis?.compradoresActivos ?? 0, icon: Users, color: "text-purple-600", bg: "bg-purple-100", path: "/users?tab=comprador" },
    { title: "Productos Publicados", value: adminKpis?.productosPublicados ?? 0, icon: Sprout, color: "text-green-600", bg: "bg-green-100", path: "/products" },
    { title: "Solicitudes", value: adminKpis?.solicitudesEnRango ?? 0, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-100", path: "/agreements" },
    { title: "Entregas Completadas", value: adminKpis?.entregasCompletadas ?? 0, icon: Truck, color: "text-emerald-600", bg: "bg-emerald-100", path: "/agreements" },
    { title: "Canceladas", value: adminKpis?.entregasCanceladas ?? 0, icon: XCircle, color: "text-red-600", bg: "bg-red-100", path: "/agreements" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Panel de la Asociación</h1>
        <p className="text-gray-500 text-lg mt-2">Supervisión, moderación y estadísticas del sistema</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} to={item.path}>
              <Card className="hover:border-green-600 hover:shadow-md transition-all h-full cursor-pointer border-transparent shadow-sm">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3 h-full">
                  <div className={`p-4 rounded-2xl ${item.bg} ${item.color} mb-2`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-black text-gray-900">{loading ? "…" : item.value}</h3>
                  <p className="text-gray-600 font-medium leading-tight">{item.title}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-green-600" /> Gestión Rápida
          </h2>
          <div className="grid gap-4">
            <Link to="/users" className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-500 transition-all">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Users className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">Gestión de Usuarios</p>
                <p className="text-sm text-gray-500">Alta, moderación y reinicio de PIN</p>
              </div>
            </Link>
            <Link to="/agreements" className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-orange-500 transition-all">
              <div className="bg-orange-50 p-3 rounded-full text-orange-600"><Handshake className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">Supervisar Acuerdos</p>
                <p className="text-sm text-gray-500">Entregas, cancelaciones e incidencias</p>
              </div>
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="text-indigo-600" /> Reportes
          </h2>
          <div className="grid gap-4">
            <Link to="/reports" className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-500 transition-all">
              <div className="bg-indigo-50 p-3 rounded-full text-indigo-600"><BarChart3 className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">Estadísticas y Reportes</p>
                <p className="text-sm text-gray-500">Datos agregados y anonimizados</p>
              </div>
            </Link>
            <Link to="/agreements" className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-red-500 transition-all">
              <div className="bg-red-50 p-3 rounded-full text-red-600"><AlertCircle className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">Incidencias ({adminKpis?.incidenciasTotales ?? 0})</p>
                <p className="text-sm text-gray-500">Inconformidades y reportes</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
