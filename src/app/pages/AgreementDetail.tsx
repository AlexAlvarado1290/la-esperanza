import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, MapPin, Truck, CheckCircle, XCircle, User, Box, Clock, Calendar,
  MessageSquare, Send, AlertTriangle, Banknote, History,
} from "lucide-react";
import { Button, Card, CardContent, Badge, Label, Input, Textarea } from "../components/ui";
import { clsx } from "clsx";
import { api, ApiError } from "../../lib/api";
import { useAuth, useRole } from "../../lib/auth";
import type {
  Acuerdo, EstadoAcuerdo, MensajeAcuerdo, PuntoEntrega,
  SeguimientoEntrega, Solicitud, TipoReporte,
} from "../../lib/types";

const STATUS_FLOW: { id: EstadoAcuerdo; label: string }[] = [
  { id: "SOLICITADO", label: "Solicitud enviada" },
  { id: "ACEPTADO", label: "Aceptada" },
  { id: "PREPARANDO", label: "Preparando" },
  { id: "PROGRAMADO", label: "Programada" },
  { id: "EN_RUTA", label: "En ruta" },
  { id: "ENTREGADO_PRODUCTOR", label: "Entregada (productor)" },
  { id: "CONFIRMADO_COMPRADOR", label: "Confirmada (comprador)" },
];

const PAYMENT_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONTRA_ENTREGA: "Pago contra entrega",
  REALIZADO: "Pago realizado",
};
const paymentBadge: Record<string, "warning" | "neutral" | "success"> = {
  PENDIENTE: "warning",
  CONTRA_ENTREGA: "neutral",
  REALIZADO: "success",
};

const INCIDENCE_TYPE_LABELS: Record<TipoReporte, string> = {
  INCONFORMIDAD_CANTIDAD: "Inconformidad con cantidad",
  INCONFORMIDAD_CALIDAD: "Inconformidad con calidad",
  INCUMPLIMIENTO_ENTREGA: "Incumplimiento de entrega",
  OTRO: "Otro",
};

const formatStatus = (s: string) => STATUS_FLOW.find((x) => x.id === s)?.label ?? s.replace(/_/g, " ");
const fmt = (iso: string) => new Date(iso).toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short" });

export function AgreementDetail() {
  const navigate = useNavigate();
  const { id: rawId } = useParams();
  const role = useRole();
  const { user } = useAuth();

  // El id puede venir como "sol-123" para solicitudes que aún no son acuerdo.
  const isSolicitud = rawId?.startsWith("sol-") ?? false;
  const numericId = Number(rawId?.replace("sol-", ""));

  const [acuerdo, setAcuerdo] = useState<Acuerdo | null>(null);
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [tracking, setTracking] = useState<SeguimientoEntrega[]>([]);
  const [messages, setMessages] = useState<MensajeAcuerdo[]>([]);
  const [puntos, setPuntos] = useState<PuntoEntrega[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [newMsg, setNewMsg] = useState("");
  const [transitionTo, setTransitionTo] = useState<EstadoAcuerdo | null>(null);
  const [transitionComment, setTransitionComment] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelObservation, setCancelObservation] = useState("");
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [finalPrice, setFinalPrice] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [selectedPointId, setSelectedPointId] = useState<string>("");
  const [acceptObservations, setAcceptObservations] = useState("");
  const [showIncidence, setShowIncidence] = useState(false);
  const [incidenceType, setIncidenceType] = useState<TipoReporte>("INCONFORMIDAD_CALIDAD");
  const [incidenceText, setIncidenceText] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectMotivo, setRejectMotivo] = useState("");

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSolicitud) {
        const s = await api.get<Solicitud>(`/requests`).then(
          (list: any[]) => (list as Solicitud[]).find((x) => x.idSolicitud === numericId) ?? null,
        );
        setSolicitud(s);
      } else {
        const a = await api.get<Acuerdo>(`/agreements/${numericId}`);
        setAcuerdo(a);
        setTracking(a.seguimientos ?? []);
        setMessages(a.mensajes ?? []);
      }
      const pts = await api.get<PuntoEntrega[]>("/master-data/delivery-points");
      setPuntos(pts);
      if (pts.length > 0) setSelectedPointId(String(pts[0].idPuntoEntrega));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawId]);

  if (loading) return <p className="text-center py-12 text-gray-500">Cargando…</p>;
  if (error) return <p className="text-center py-12 text-red-600">{error}</p>;

  // --------------------------------------------------------------------- //
  // Vista de SOLICITUD pendiente (todavía no es Acuerdo).                  //
  // --------------------------------------------------------------------- //
  if (isSolicitud) {
    if (!solicitud) return <p className="text-center py-12 text-gray-500">Solicitud no encontrada.</p>;
    const handleAccept = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const created = await api.post<Acuerdo>(`/agreements/from-request/${solicitud.idSolicitud}`, {
          precioFinal: Number(finalPrice),
          fechaProgramada: new Date(scheduledDate).toISOString(),
          idPuntoEntrega: Number(selectedPointId),
          observaciones: acceptObservations || undefined,
        });
        navigate(`/agreements/${created.idAcuerdo}`);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Error al aceptar.");
      }
    };
    const handleReject = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await api.post(`/requests/${solicitud.idSolicitud}/reject`, { motivo: rejectMotivo });
        navigate("/agreements");
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Error al rechazar.");
      }
    };
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <header className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full border border-gray-200">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Solicitud #{solicitud.idSolicitud}</h1>
            <p className="text-gray-500">A la espera de respuesta del productor</p>
          </div>
        </header>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Badge variant="warning" className="uppercase mb-2">{formatStatus(solicitud.estadoSolicitud)}</Badge>
              <h2 className="text-2xl font-bold">{solicitud.producto?.nombre}</h2>
              <p className="text-gray-600">
                Cantidad: <strong>{Number(solicitud.cantidadSolicitada)} {solicitud.producto?.unidad.abreviatura}</strong>
              </p>
              <p className="text-gray-600">
                Comprador: <strong>{solicitud.comprador?.nombreCompleto}</strong>
              </p>
              <p className="text-gray-600">
                Productor: <strong>{solicitud.producto?.productor.nombreCompleto}</strong>
              </p>
              {solicitud.mensajeInicial && (
                <div className="bg-gray-50 p-4 rounded-xl mt-3">
                  <p className="text-sm font-semibold text-gray-500 mb-1">Mensaje inicial:</p>
                  <p className="text-gray-700">{solicitud.mensajeInicial}</p>
                </div>
              )}
            </div>
            {role === "producer" && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button onClick={() => setShowAcceptModal(true)} size="lg" className="gap-2"><CheckCircle /> Aceptar</Button>
                <Button onClick={() => setRejectModal(true)} variant="danger" size="lg" className="gap-2"><XCircle /> Rechazar</Button>
              </div>
            )}
            {role === "buyer" && solicitud.idComprador === user?.idUsuario && (
              <div className="pt-4 border-t">
                <Button
                  variant="danger"
                  className="gap-2"
                  onClick={async () => {
                    const m = window.prompt("Motivo de cancelación:") ?? "";
                    if (!m.trim()) return;
                    try {
                      await api.delete(`/requests/${solicitud.idSolicitud}`, { motivo: m });
                      navigate("/agreements");
                    } catch (e) {
                      setError(e instanceof ApiError ? e.message : "Error al cancelar.");
                    }
                  }}
                >
                  <XCircle /> Cancelar Solicitud
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {showAcceptModal && (
          <Card className="border-green-200 bg-green-50/30">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-green-800">Registrar Acuerdo Comercial</h3>
              <form onSubmit={handleAccept} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Precio Final (Q) *</Label>
                    <Input type="number" step="0.01" required value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} />
                  </div>
                  <div>
                    <Label>Fecha Programada *</Label>
                    <Input type="date" required value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Punto de Entrega *</Label>
                  <select className="flex h-14 w-full rounded-xl border-2 border-gray-300 px-4 text-lg" required value={selectedPointId} onChange={(e) => setSelectedPointId(e.target.value)}>
                    {puntos.map((p) => (
                      <option key={p.idPuntoEntrega} value={p.idPuntoEntrega}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Observaciones</Label>
                  <Textarea value={acceptObservations} onChange={(e) => setAcceptObservations(e.target.value)} className="h-20 resize-none" />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowAcceptModal(false)} className="flex-1">Cancelar</Button>
                  <Button type="submit" className="flex-1">Confirmar Aceptación</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {rejectModal && (
          <Card className="border-red-200 bg-red-50/30">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-red-800">Rechazar Solicitud</h3>
              <form onSubmit={handleReject} className="space-y-3">
                <Label>Motivo *</Label>
                <Textarea required value={rejectMotivo} onChange={(e) => setRejectMotivo(e.target.value)} className="h-20 resize-none" />
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setRejectModal(false)} className="flex-1">Cancelar</Button>
                  <Button type="submit" variant="danger" className="flex-1">Rechazar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------- //
  // Vista del Acuerdo completo                                            //
  // --------------------------------------------------------------------- //
  if (!acuerdo) return <p className="text-center py-12 text-gray-500">Acuerdo no encontrado.</p>;

  const isCanceled = acuerdo.estadoAcuerdo === "CANCELADO";
  const currentIndex = STATUS_FLOW.findIndex((s) => s.id === acuerdo.estadoAcuerdo);
  const producerName = acuerdo.solicitud?.producto.productor.nombreCompleto ?? "—";
  const buyerName = acuerdo.solicitud?.comprador.nombreCompleto ?? "—";
  const productName = acuerdo.solicitud?.producto.nombre ?? "—";

  const transition = async (estado: EstadoAcuerdo, comentario?: string) => {
    try {
      await api.patch(`/agreements/${acuerdo.idAcuerdo}/transition`, { estado, comentario });
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error en la transición.");
    }
  };

  const confirmTransition = async () => {
    if (!transitionTo) return;
    await transition(transitionTo, transitionComment.trim() || undefined);
    setTransitionTo(null);
    setTransitionComment("");
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    const motivo = cancelObservation
      ? `${cancelReason} — ${cancelObservation}`
      : cancelReason;
    try {
      await api.patch(`/agreements/${acuerdo.idAcuerdo}/cancel`, { motivo });
      setShowCancelModal(false);
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al cancelar.");
    }
  };

  const handlePaymentChange = async (ps: "PENDIENTE" | "CONTRA_ENTREGA" | "REALIZADO") => {
    try {
      await api.patch(`/agreements/${acuerdo.idAcuerdo}/pago`, { estadoPago: ps });
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al actualizar pago.");
    }
  };

  const handleSendMsg = async () => {
    if (!newMsg.trim()) return;
    try {
      await api.post(`/agreements/${acuerdo.idAcuerdo}/messages`, { mensaje: newMsg });
      setNewMsg("");
      const list = await api.get<MensajeAcuerdo[]>(`/agreements/${acuerdo.idAcuerdo}/messages`);
      setMessages(list);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo enviar el mensaje.");
    }
  };

  const handleReportIncidence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/incidents/agreements/${acuerdo.idAcuerdo}`, {
        tipo: incidenceType,
        descripcion: incidenceText,
      });
      setShowIncidence(false);
      setIncidenceText("");
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al reportar.");
    }
  };

  const askTransition = (next: EstadoAcuerdo) => {
    setTransitionTo(next);
    setTransitionComment("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900">Acuerdo #AC-{acuerdo.idAcuerdo}</h1>
          <p className="text-gray-500 mt-1 text-lg">Seguimiento y detalle</p>
        </div>
        <Badge
          variant={isCanceled ? "danger" : acuerdo.estadoAcuerdo === "CONFIRMADO_COMPRADOR" ? "success" : "warning"}
          className="uppercase px-4 py-2 text-sm font-bold shadow-sm"
        >
          {formatStatus(acuerdo.estadoAcuerdo)}
        </Badge>
      </header>

      {/* Stepper */}
      <Card className="mb-6 shadow-sm border-gray-100 overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" /> Seguimiento del Pedido
          </h3>
          {isCanceled ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 font-semibold">
              <XCircle className="w-6 h-6" /> Este pedido ha sido cancelado.
              {acuerdo.justificacionIncumplimiento && (
                <p className="text-sm font-normal mt-2">Motivo: {acuerdo.justificacionIncumplimiento}</p>
              )}
            </div>
          ) : (
            <div className="relative flex flex-col md:flex-row justify-between gap-4 md:gap-0 mt-4 md:mt-8">
              <div className="hidden md:block absolute top-4 left-6 right-6 h-1 bg-gray-200 rounded-full z-0" />
              <div className="md:hidden absolute top-0 bottom-0 left-[19px] w-1 bg-gray-200 rounded-full z-0" />
              {STATUS_FLOW.map((step, index) => {
                const isCompleted = currentIndex >= 0 && index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                  <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2">
                    <div
                      className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center border-4 shrink-0",
                        isCompleted ? "bg-green-600 border-green-200 text-white" : "bg-white border-gray-200 text-gray-400",
                      )}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                    </div>
                    <span
                      className={clsx(
                        "text-sm font-bold md:text-center max-w-[100px]",
                        isCurrent ? "text-green-800" : isCompleted ? "text-gray-800" : "text-gray-400",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bitácora */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" /> Bitácora de Seguimiento
          </h3>
          <div className="space-y-3">
            {tracking.length === 0 ? (
              <p className="text-gray-500">Sin entradas todavía.</p>
            ) : (
              tracking.map((t) => (
                <div key={t.idSeguimiento} className="border-l-4 border-indigo-400 bg-indigo-50/40 pl-4 py-2 rounded">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="neutral" className="uppercase text-xs">{formatStatus(t.estado)}</Badge>
                    <span className="text-xs text-gray-500">
                      {t.usuario?.nombreCompleto ?? `#${t.idUsuario}`} · {fmt(t.fechaHora)}
                    </span>
                  </div>
                  {t.comentario && <p className="text-sm text-gray-700">{t.comentario}</p>}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-yellow-500 shadow-md">
        <CardContent className="p-0">
          <div className="p-6 md:p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-700" /> Productor
                </h3>
                <p className="text-2xl font-black text-gray-900">{producerName}</p>
                <p className="text-gray-600">Tel: {acuerdo.solicitud?.producto.productor.telefono ?? "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-700" /> Comprador
                </h3>
                <p className="text-2xl font-black text-gray-900">{buyerName}</p>
                <p className="text-gray-600">Tel: {acuerdo.solicitud?.comprador.telefono ?? "—"}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Box className="w-6 h-6 text-green-700" /> Detalles del Pedido
              </h3>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 grid grid-cols-2 gap-y-6">
                <div>
                  <p className="text-gray-500 text-lg">Producto</p>
                  <p className="text-2xl font-black text-gray-900">{productName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-lg">Cantidad</p>
                  <p className="text-2xl font-black text-gray-900">
                    {Number(acuerdo.cantidadAcordada)} {acuerdo.solicitud?.producto.unidad.abreviatura}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-lg">Precio Referencial</p>
                  <p className="text-2xl font-black text-gray-400 line-through">
                    Q{Number(acuerdo.solicitud?.producto.precioReferencial ?? 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-lg">Precio Final</p>
                  <p className="text-3xl font-black text-green-700">Q{Number(acuerdo.precioFinal).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-lg">Fecha Programada</p>
                  <p className="text-2xl font-black text-gray-900">{acuerdo.fechaProgramada.slice(0, 10)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-lg">Estado de Pago</p>
                  <Badge variant={paymentBadge[acuerdo.estadoPago]} className="text-sm px-3 py-1">
                    <Banknote className="w-4 h-4 mr-1 inline" /> {PAYMENT_LABELS[acuerdo.estadoPago]}
                  </Badge>
                </div>
              </div>
            </div>

            {(role === "producer" || role === "admin") && !isCanceled && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-yellow-600" /> Registrar Estado de Pago
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(["PENDIENTE", "CONTRA_ENTREGA", "REALIZADO"] as const).map((ps) => (
                    <button
                      key={ps}
                      onClick={() => handlePaymentChange(ps)}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-colors",
                        acuerdo.estadoPago === ps ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                      )}
                    >
                      {PAYMENT_LABELS[ps]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-orange-600" /> Logística
              </h3>
              <div className="space-y-4 bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                <div>
                  <p className="text-gray-500 text-lg">Punto de Entrega</p>
                  <p className="text-xl font-bold text-gray-900">{acuerdo.puntoEntrega?.nombre ?? "—"}</p>
                  {acuerdo.puntoEntrega?.referencia && (
                    <p className="text-sm text-gray-500">{acuerdo.puntoEntrega.referencia}</p>
                  )}
                </div>
                {acuerdo.observaciones && (
                  <div>
                    <p className="text-gray-500 text-lg">Observaciones</p>
                    <p className="text-lg text-gray-800">{acuerdo.observaciones}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="border-t border-gray-200 pt-8 flex flex-col gap-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Acciones</h3>

              {(role === "producer" || role === "admin") && !isCanceled && acuerdo.estadoAcuerdo !== "CONFIRMADO_COMPRADOR" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {acuerdo.estadoAcuerdo === "ACEPTADO" && (
                    <Button onClick={() => askTransition("PREPARANDO")} size="lg" className="w-full gap-2 text-lg h-16 md:col-span-2">
                      <Box /> Empezar a Preparar
                    </Button>
                  )}
                  {acuerdo.estadoAcuerdo === "PREPARANDO" && (
                    <Button onClick={() => askTransition("PROGRAMADO")} size="lg" className="w-full gap-2 text-lg h-16 md:col-span-2">
                      <Calendar /> Confirmar Programación
                    </Button>
                  )}
                  {acuerdo.estadoAcuerdo === "PROGRAMADO" && (
                    <Button onClick={() => askTransition("EN_RUTA")} size="lg" className="w-full gap-2 text-lg h-16 md:col-span-2">
                      <Truck /> Iniciar Ruta
                    </Button>
                  )}
                  {acuerdo.estadoAcuerdo === "EN_RUTA" && (
                    <Button onClick={() => askTransition("ENTREGADO_PRODUCTOR")} size="lg" className="w-full gap-2 text-lg h-16 md:col-span-2 bg-green-700 hover:bg-green-800 text-white">
                      <CheckCircle /> Marcar como Entregada
                    </Button>
                  )}
                  {acuerdo.estadoAcuerdo === "ENTREGADO_PRODUCTOR" && role === "producer" && (
                    <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm font-semibold">
                      Esperando confirmación del comprador…
                    </div>
                  )}
                </div>
              )}

              {role === "buyer" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {acuerdo.estadoAcuerdo === "ENTREGADO_PRODUCTOR" && (
                    <Button onClick={() => askTransition("CONFIRMADO_COMPRADOR")} size="lg" className="w-full gap-2 text-lg h-16 md:col-span-2 bg-green-700 hover:bg-green-800 text-white">
                      <CheckCircle /> Confirmar Recepción
                    </Button>
                  )}
                  {(acuerdo.estadoAcuerdo === "ENTREGADO_PRODUCTOR" || acuerdo.estadoAcuerdo === "CONFIRMADO_COMPRADOR") && (
                    <Button variant="outline" size="lg" className="w-full gap-2 text-lg h-16 md:col-span-2 border-red-200 text-red-700 hover:bg-red-50" onClick={() => setShowIncidence(true)}>
                      <AlertTriangle /> Reportar Inconformidad
                    </Button>
                  )}
                </div>
              )}

              {!isCanceled && acuerdo.estadoAcuerdo !== "CONFIRMADO_COMPRADOR" && (
                <Button onClick={() => setShowCancelModal(true)} variant="danger" size="lg" className="w-full gap-2 text-lg h-16">
                  <XCircle /> {role === "admin" ? "Forzar Cancelación" : "Cancelar Acuerdo"}
                </Button>
              )}
            </div>

            {/* Modal transición */}
            {transitionTo && (
              <Card className="border-blue-200 bg-blue-50/30">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                    <Clock /> Actualizar a: {formatStatus(transitionTo)}
                  </h3>
                  <Label>Comentario de seguimiento (opcional)</Label>
                  <Textarea value={transitionComment} onChange={(e) => setTransitionComment(e.target.value)} className="h-20 resize-none" />
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setTransitionTo(null)} className="flex-1">Cancelar</Button>
                    <Button onClick={confirmTransition} className="flex-1">Confirmar</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modal cancelación */}
            {showCancelModal && (
              <Card className="border-red-200 bg-red-50/30">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-red-800 flex items-center gap-2"><XCircle /> Cancelar Acuerdo</h3>
                  <Label>Motivo *</Label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="flex h-14 w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg"
                    required
                  >
                    <option value="">Seleccionar motivo…</option>
                    <option value="No puede cumplir con la cantidad">No puede cumplir con la cantidad</option>
                    <option value="Problema con el precio">Problema con el precio</option>
                    <option value="Producto no disponible">Producto no disponible</option>
                    <option value="Cambio de planes">Cambio de planes</option>
                    <option value="Incumplimiento de entrega">Incumplimiento de entrega</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <Label>Observación</Label>
                  <Textarea value={cancelObservation} onChange={(e) => setCancelObservation(e.target.value)} className="h-20 resize-none" />
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setShowCancelModal(false)} className="flex-1">Volver</Button>
                    <Button variant="danger" onClick={handleCancel} className="flex-1" disabled={!cancelReason}>Confirmar Cancelación</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modal incidencia */}
            {showIncidence && (
              <Card className="border-orange-200 bg-orange-50/30">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-orange-800 flex items-center gap-2"><AlertTriangle /> Reportar Inconformidad</h3>
                  <form onSubmit={handleReportIncidence} className="space-y-3">
                    <Label>Tipo *</Label>
                    <select value={incidenceType} onChange={(e) => setIncidenceType(e.target.value as TipoReporte)} className="flex h-14 w-full rounded-xl border-2 border-gray-300 bg-white px-4 text-lg">
                      {(Object.keys(INCIDENCE_TYPE_LABELS) as TipoReporte[]).map((k) => (
                        <option key={k} value={k}>{INCIDENCE_TYPE_LABELS[k]}</option>
                      ))}
                    </select>
                    <Label>Descripción *</Label>
                    <Textarea required value={incidenceText} onChange={(e) => setIncidenceText(e.target.value)} className="h-24 resize-none" />
                    <div className="flex gap-3">
                      <Button type="button" variant="ghost" onClick={() => setShowIncidence(false)} className="flex-1">Cancelar</Button>
                      <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" disabled={!incidenceText.trim()}>Enviar Reporte</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-600" /> Mensajes
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-6 space-y-4">
                <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-2">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-500">Sin mensajes todavía.</p>
                  ) : (
                    messages.map((m) => {
                      const isMine = user?.idUsuario === m.idRemitente;
                      return (
                        <div key={m.idMensaje} className={clsx("flex flex-col gap-1 max-w-[85%]", isMine ? "items-end self-end" : "items-start")}>
                          <div className={clsx("p-3 rounded-2xl shadow-sm", isMine ? "bg-green-100 border border-green-200 text-gray-900 rounded-tr-sm" : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm")}>
                            <p className={clsx("text-sm font-bold mb-1", isMine ? "text-green-700" : "text-gray-500")}>{m.remitente?.nombreCompleto ?? `#${m.idRemitente}`}</p>
                            <p>{m.mensaje}</p>
                          </div>
                          <span className="text-xs text-gray-400">{fmt(m.fechaHora)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                {!isCanceled && role !== "guest" && (
                  <div className="pt-4 border-t border-gray-200 flex gap-2">
                    <Input placeholder="Escribe un mensaje…" className="flex-1" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMsg()} />
                    <Button size="icon" className="w-12 h-12 shrink-0 bg-blue-600 hover:bg-blue-700" onClick={handleSendMsg}>
                      <Send className="w-5 h-5 text-white" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
