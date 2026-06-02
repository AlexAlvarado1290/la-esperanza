import { useEffect, useState } from "react";
import { ArrowLeft, TrendingUp, Users, Sprout, Handshake, Truck, AlertTriangle, XCircle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { api, ApiError } from "../../lib/api";
import { useRole } from "../../lib/auth";

interface GeneralReport {
  kpis: {
    productoresActivos: number;
    compradoresActivos: number;
    productosPublicados: number;
    solicitudesEnRango: number;
    entregasCompletadas: number;
    entregasCanceladas: number;
    incidenciasTotales: number;
  };
  ventasPorCategoria: Record<string, { total: number; cantidad: number }>;
  solicitudesPorMes: Record<string, number>;
  distribucionAcuerdos: { estado: string; total: number }[];
}

const COLORS = ["#16a34a", "#eab308", "#dc2626", "#3b82f6", "#a855f7", "#0ea5e9"];

export function Reports() {
  const navigate = useNavigate();
  const role = useRole();
  const [data, setData] = useState<GeneralReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const d = await api.get<GeneralReport>("/reports/general");
        setData(d);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "No se pudo cargar.");
      } finally {
        setLoading(false);
      }
    })();
  }, [role]);

  if (role !== "admin") {
    return <div className="text-center py-20 text-gray-500 text-lg">Sólo la Asociación accede a estos reportes.</div>;
  }
  if (loading) return <p className="text-center py-12 text-gray-500">Cargando…</p>;
  if (error || !data) return <p className="text-center py-12 text-red-600">{error}</p>;

  const kpis = [
    { label: "Productores Activos", value: data.kpis.productoresActivos, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Compradores Activos", value: data.kpis.compradoresActivos, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Productos Publicados", value: data.kpis.productosPublicados, icon: Sprout, color: "text-green-600", bg: "bg-green-100" },
    { label: "Solicitudes (rango)", value: data.kpis.solicitudesEnRango, icon: Handshake, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Entregas Completadas", value: data.kpis.entregasCompletadas, icon: Truck, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Entregas Canceladas", value: data.kpis.entregasCanceladas, icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
    { label: "Incidencias", value: data.kpis.incidenciasTotales, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  const ventasData = Object.entries(data.ventasPorCategoria).map(([categoria, v]) => ({ categoria, total: v.total, kg: v.cantidad }));
  const mesesData = Object.entries(data.solicitudesPorMes)
    .sort()
    .map(([mes, total]) => ({ mes, total }));
  const acuerdosPie = data.distribucionAcuerdos.map((d, i) => ({ name: d.estado, value: d.total, color: COLORS[i % COLORS.length] }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-500 mt-1 text-lg">Datos agregados y anonimizados de la comunidad</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="border-transparent shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-2xl ${k.bg} ${k.color}`}><Icon className="w-6 h-6" /></div>
                <h3 className="text-3xl font-black text-gray-900">{k.value}</h3>
                <p className="text-gray-600 text-sm font-medium leading-tight">{k.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-600" /> Ventas Agregadas por Categoría (Q)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventasData}>
                <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`Q${v.toLocaleString()}`, "Total"]} />
                <Bar dataKey="total" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 mt-3">* Datos anonimizados. No se identifica productor ni comprador individual (RF34).</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" /> Solicitudes por Mes
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mesesData}>
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Handshake className="w-6 h-6 text-yellow-600" /> Distribución de Acuerdos
            </h3>
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={acuerdosPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {acuerdosPie.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
