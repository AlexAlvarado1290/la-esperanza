import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Calendar, ChevronRight, Banknote } from "lucide-react";
import { Card, CardContent, Badge } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import { useAuth, useRole } from "../../lib/auth";
import type { Acuerdo, EstadoAcuerdo, Solicitud } from "../../lib/types";

// Tipo unificado para render: tanto solicitudes pendientes como acuerdos
// se muestran como tarjetas con el mismo formato.
type AgreementRow = {
  id: string;            // AC-{idAcuerdo} o SOL-{idSolicitud}
  idAcuerdo: number | null;
  idSolicitud: number;
  producer: string;
  buyer: string;
  product: string;
  qty: string;
  price: string;
  status: string;        // EstadoAcuerdo o 'PENDIENTE_RESPUESTA'
  date: string;
  paymentStatus: string;
};

const statusVariant: Record<string, "warning" | "neutral" | "success" | "danger"> = {
  PENDIENTE_RESPUESTA: "warning",
  SOLICITADO: "warning",
  ACEPTADO: "neutral",
  PREPARANDO: "neutral",
  PROGRAMADO: "neutral",
  EN_RUTA: "warning",
  ENTREGADO_PRODUCTOR: "warning",
  CONFIRMADO_COMPRADOR: "success",
  CANCELADO: "danger",
  INCIDENCIA: "warning",
  RESUELTA_CONFIRMADA: "danger",
  RESUELTA_DESCARTADA: "success",
  INCUMPLIDA_POR_TIEMPO: "danger",
};

const statusLabel: Record<string, string> = {
  PENDIENTE_RESPUESTA: "Solicitud enviada",
  SOLICITADO: "Solicitada",
  ACEPTADO: "Aceptada",
  PREPARANDO: "Preparando",
  PROGRAMADO: "Programada",
  EN_RUTA: "En ruta",
  ENTREGADO_PRODUCTOR: "Entregada (productor)",
  CONFIRMADO_COMPRADOR: "Confirmada ✓",
  CANCELADO: "Cancelado",
  INCIDENCIA: "Con incidencia",
  RESUELTA_CONFIRMADA: "Resuelta (incumplida)",
  RESUELTA_DESCARTADA: "Resuelta (vuelta al flujo)",
  INCUMPLIDA_POR_TIEMPO: "Incumplida (7 días sin confirmar)",
};

const paymentLabel: Record<string, string> = {
  PENDIENTE: "Pago pendiente",
  CONTRA_ENTREGA: "Contra entrega",
  REALIZADO: "Pagado",
};

type FilterTab = "todos" | "pendientes" | "proceso" | "completados" | "cancelados";

const enProceso: EstadoAcuerdo[] = [
  "ACEPTADO", "PREPARANDO", "PROGRAMADO", "EN_RUTA", "ENTREGADO_PRODUCTOR", "INCIDENCIA",
];

export function AgreementsList() {
  const role = useRole();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FilterTab>("todos");
  const [items, setItems] = useState<AgreementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  let title = "Supervisión de Acuerdos";
  let subtitle = "Seguimiento general de acuerdos y entregas";
  if (role === "buyer") {
    title = "Mis Compras";
    subtitle = "Estado de tus solicitudes y pedidos";
  } else if (role === "producer") {
    title = "Mis Acuerdos";
    subtitle = "Solicitudes recibidas y ventas";
  }

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Combinamos solicitudes pendientes + acuerdos.
        const [solicitudes, acuerdos] = await Promise.all([
          api.get<Solicitud[]>("/requests", { query: { estado: "SOLICITADO" } }).catch(() => []),
          api.get<Acuerdo[]>("/agreements"),
        ]);
        if (cancel) return;
        const rows: AgreementRow[] = [];
        for (const s of solicitudes) {
          rows.push({
            id: `SOL-${s.idSolicitud}`,
            idAcuerdo: null,
            idSolicitud: s.idSolicitud,
            producer: s.producto?.productor.nombreCompleto ?? "—",
            buyer: s.comprador?.nombreCompleto ?? "—",
            product: s.producto?.nombre ?? "—",
            qty: `${Number(s.cantidadSolicitada)} ${s.producto?.unidad.abreviatura ?? ""}`,
            price: `Q${(Number(s.producto?.precioReferencial ?? 0) * Number(s.cantidadSolicitada)).toFixed(2)} ref`,
            status: "PENDIENTE_RESPUESTA",
            date: s.fechaSolicitud.slice(0, 10),
            paymentStatus: "PENDIENTE",
          });
        }
        for (const a of acuerdos) {
          rows.push({
            id: `AC-${a.idAcuerdo}`,
            idAcuerdo: a.idAcuerdo,
            idSolicitud: a.idSolicitud,
            producer: a.solicitud?.producto.productor.nombreCompleto ?? "—",
            buyer: a.solicitud?.comprador.nombreCompleto ?? "—",
            product: a.solicitud?.producto.nombre ?? "—",
            qty: `${Number(a.cantidadAcordada)} ${a.solicitud?.producto.unidad.abreviatura ?? ""}`,
            price: `Q${(Number(a.precioFinal) * Number(a.cantidadAcordada)).toFixed(2)}`,
            status: a.estadoAcuerdo,
            date: a.fechaProgramada.slice(0, 10),
            paymentStatus: a.estadoPago,
          });
        }
        setItems(rows);
      } catch (e) {
        if (!cancel) setError(e instanceof ApiError ? e.message : "No se pudo cargar.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user?.idUsuario]);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (activeTab === "todos") return true;
      if (activeTab === "pendientes") return r.status === "PENDIENTE_RESPUESTA" || r.status === "SOLICITADO";
      if (activeTab === "proceso") return enProceso.includes(r.status as EstadoAcuerdo);
      if (activeTab === "completados") return r.status === "CONFIRMADO_COMPRADOR";
      if (activeTab === "cancelados") return ["CANCELADO", "INCUMPLIDA_POR_TIEMPO", "RESUELTA_CONFIRMADA"].includes(r.status);
      return true;
    });
  }, [activeTab, items]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "pendientes", label: "Pendientes" },
    { key: "proceso", label: "En Proceso" },
    { key: "completados", label: "Completados" },
    { key: "cancelados", label: "Cancelados" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1 text-lg">{subtitle}</p>
      </header>

      <div className="bg-white rounded-2xl p-2 flex gap-2 overflow-x-auto snap-x border border-gray-200 shadow-sm mb-6 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap flex-1 snap-start text-base font-bold py-3 px-4 rounded-xl transition-colors ${
              activeTab === tab.key ? "bg-green-700 text-white shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold">{error}</div>}

      <div className="grid gap-4">
        {loading ? (
          <p className="text-center py-12 text-gray-500">Cargando…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-lg">No hay acuerdos en esta categoría.</div>
        ) : (
          filtered.map((agr) => {
            const linkTo = agr.idAcuerdo
              ? `/agreements/${agr.idAcuerdo}`
              : `/agreements/sol-${agr.idSolicitud}`;
            return (
              <Link to={linkTo} key={agr.id}>
                <Card className="hover:border-green-500 active:scale-[0.99] transition-all cursor-pointer">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex justify-between items-start mr-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={statusVariant[agr.status] ?? "neutral"} className="uppercase tracking-wide text-xs">
                            {statusLabel[agr.status] ?? agr.status}
                          </Badge>
                          {agr.idAcuerdo && (
                            <Badge
                              variant={agr.paymentStatus === "REALIZADO" ? "success" : agr.paymentStatus === "CONTRA_ENTREGA" ? "neutral" : "warning"}
                              className="text-xs flex items-center gap-1"
                            >
                              <Banknote className="w-3 h-3" /> {paymentLabel[agr.paymentStatus]}
                            </Badge>
                          )}
                        </div>
                        <span className="text-gray-400 font-bold text-sm">#{agr.id}</span>
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{agr.product}</h2>
                        <p className="text-gray-600 text-lg flex flex-col sm:flex-row sm:gap-4">
                          <span>Productor: <span className="font-semibold text-gray-800">{agr.producer}</span></span>
                          <span className="hidden sm:inline text-gray-300">|</span>
                          <span>Comprador: <span className="font-semibold text-gray-800">{agr.buyer}</span></span>
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                        <p className="text-gray-700 font-bold text-lg">
                          {agr.qty} <span className="text-green-700 mx-2">•</span> {agr.price}
                        </p>
                        <p className="text-gray-500 flex items-center gap-1 font-medium">
                          <Calendar className="w-4 h-4" /> {agr.date}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-8 h-8 text-gray-400 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
