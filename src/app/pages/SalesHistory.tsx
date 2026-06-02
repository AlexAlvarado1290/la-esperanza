import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Calendar, TrendingUp, Banknote, Package } from "lucide-react";
import { Card, CardContent, Badge, Button } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api, ApiError } from "../../lib/api";
import { useRole } from "../../lib/auth";
import type { Acuerdo } from "../../lib/types";

interface SalesReport {
  resumen: {
    totalVendido: number;
    entregasConfirmadas: number;
    entregasIncumplidas: number;
    totalAcuerdos: number;
    tasaCumplimiento: number;
  };
  ingresosMensuales: Record<string, number>;
  acuerdos: Acuerdo[];
}

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  CONFIRMADA: "success",
  INCUMPLIDA: "warning",
  CANCELADA: "danger",
};

export function SalesHistory() {
  const navigate = useNavigate();
  const role = useRole();
  const [data, setData] = useState<SalesReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<"todo" | string>("todo");

  useEffect(() => {
    if (role !== "producer") {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const d = await api.get<SalesReport>("/reports/sales-history", {
          query: { year: yearFilter === "todo" ? undefined : yearFilter },
        });
        setData(d);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "No se pudo cargar.");
      } finally {
        setLoading(false);
      }
    })();
  }, [role, yearFilter]);

  const monthly = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.ingresosMensuales)
      .sort()
      .map(([mes, total]) => ({ mes: mes.slice(5), total }));
  }, [data]);

  if (role !== "producer") {
    return <div className="text-center py-20 text-gray-500 text-lg">Vista disponible únicamente para productores.</div>;
  }
  if (loading) return <p className="text-center py-12 text-gray-500">Cargando…</p>;
  if (error || !data) return <p className="text-center py-12 text-red-600">{error}</p>;

  const years = Array.from(
    new Set(data.acuerdos.map((a) => a.fechaProgramada.slice(0, 4))),
  ).sort();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900">Historial de Ventas</h1>
          <p className="text-gray-500 mt-1 text-lg">Registro histórico de mis acuerdos comerciales</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-transparent shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-green-100 text-green-700"><Banknote className="w-6 h-6" /></div>
            <div>
              <p className="text-3xl font-black text-gray-900">Q{data.resumen.totalVendido.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Total vendido (confirmadas)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-transparent shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-700"><Package className="w-6 h-6" /></div>
            <div>
              <p className="text-3xl font-black text-gray-900">{data.resumen.entregasConfirmadas}</p>
              <p className="text-sm text-gray-500">Entregas confirmadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-transparent shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-orange-100 text-orange-700"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-3xl font-black text-gray-900">{data.resumen.entregasIncumplidas}</p>
              <p className="text-sm text-gray-500">Entregas incumplidas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" /> Ingresos por Mes (Q)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`Q${v.toLocaleString()}`, "Ingresos"]} />
                <Bar dataKey="total" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-2xl p-2 flex gap-2 border border-gray-200 shadow-sm">
        <button
          onClick={() => setYearFilter("todo")}
          className={`flex-1 text-base font-bold py-2 px-3 rounded-xl transition-colors ${
            yearFilter === "todo" ? "bg-green-700 text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Todo
        </button>
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setYearFilter(y)}
            className={`flex-1 text-base font-bold py-2 px-3 rounded-xl transition-colors ${
              yearFilter === y ? "bg-green-700 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {data.acuerdos.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No hay ventas en este periodo.</p>
        ) : (
          data.acuerdos.map((a) => (
            <Card key={a.idAcuerdo} className="hover:border-green-400">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-gray-400">#AC-{a.idAcuerdo}</span>
                    {a.estadoFinal && (
                      <Badge variant={statusVariant[a.estadoFinal]} className="uppercase text-xs">{a.estadoFinal}</Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{a.solicitud?.producto.nombre}</h2>
                  <p className="text-gray-600 text-sm">
                    Comprador: <span className="font-semibold">{a.solicitud?.comprador.nombreCompleto}</span>
                  </p>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                    <p className="text-gray-700 font-semibold">
                      {Number(a.cantidadAcordada)} {a.solicitud?.producto.unidad.abreviatura} —{" "}
                      <span className="text-green-700">
                        Q{(Number(a.precioFinal) * Number(a.cantidadAcordada)).toFixed(2)}
                      </span>
                    </p>
                    <p className="text-gray-500 flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" /> {a.fechaProgramada.slice(0, 10)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/agreements/${a.idAcuerdo}`)}>
                  Ver detalle
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
