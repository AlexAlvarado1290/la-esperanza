import { ArrowLeft, TrendingUp, Users, Sprout, Handshake, Truck, AlertTriangle, XCircle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router";
import { Card, CardContent, Badge } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const kpis = [
  { label: "Productores Activos", value: 42, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
  { label: "Compradores Activos", value: 11, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
  { label: "Productos Publicados", value: 128, icon: Sprout, color: "text-green-600", bg: "bg-green-100" },
  { label: "Solicitudes Enviadas", value: 87, icon: Handshake, color: "text-yellow-600", bg: "bg-yellow-100" },
  { label: "Entregas Completadas", value: 64, icon: Truck, color: "text-emerald-600", bg: "bg-emerald-100" },
  { label: "Entregas Canceladas", value: 9, icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
  { label: "Incidencias / Reportes", value: 4, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100" },
];

const ventasPorCategoria = [
  { categoria: "Tubérculos", kg: 12300 },
  { categoria: "Hortalizas", kg: 4520 },
  { categoria: "Cereales", kg: 8100 },
  { categoria: "Frutas", kg: 2400 },
  { categoria: "Otros", kg: 900 },
];

const solicitudesPorMes = [
  { mes: "Oct", total: 8 },
  { mes: "Nov", total: 12 },
  { mes: "Dic", total: 10 },
  { mes: "Ene", total: 15 },
  { mes: "Feb", total: 18 },
  { mes: "Mar", total: 24 },
];

const estadoAcuerdos = [
  { name: "Completadas", value: 64, color: "#16a34a" },
  { name: "En proceso", value: 14, color: "#eab308" },
  { name: "Canceladas", value: 9, color: "#dc2626" },
];

export function Reports() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-500 mt-1 text-lg">Datos agregados y anonimizados de la comunidad</p>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="border-transparent shadow-sm">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-2xl ${k.bg} ${k.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-black text-gray-900">{k.value}</h3>
                <p className="text-gray-600 text-sm font-medium leading-tight">{k.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ventas por categoría (bar chart) */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-600" /> Ventas Agregadas por Categoría (kg)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventasPorCategoria}>
                <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} kg`, 'Cantidad']} />
                <Bar dataKey="kg" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 mt-3">* Datos anonimizados. No se identifica productor ni comprador individual.</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Solicitudes por mes */}
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" /> Solicitudes por Mes
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={solicitudesPorMes}>
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Estado de acuerdos (pie) */}
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Handshake className="w-6 h-6 text-yellow-600" /> Distribución de Acuerdos
            </h3>
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={estadoAcuerdos} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {estadoAcuerdos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {estadoAcuerdos.map(e => (
                <div key={e.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                  <span className="text-gray-600">{e.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
