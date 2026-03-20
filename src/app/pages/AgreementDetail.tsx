import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Truck, CheckCircle, XCircle, CreditCard, User, Box, Clock, Calendar, MessageSquare, Send, AlertTriangle, Banknote } from "lucide-react";
import { Button, Card, CardContent, Badge, Label, Input, Textarea } from "../components/ui";
import { clsx } from "clsx";

const mockAgreement = {
  id: "AC-105",
  producer: "Asociación San José",
  producerPhone: "0991234567",
  buyer: "Mercado Sur",
  buyerPhone: "022345678",
  product: "Tomate Riñón",
  qty: "10 Cajas",
  basePrice: "Q120.00",
  negotiatedPrice: "Q115.00",
  status: "en_ruta",
  date: "2026-03-24",
  location: "Entrada principal, Mercado Sur",
  notes: "Llamar al llegar.",
  paymentStatus: "pendiente" as "pendiente" | "contra_entrega" | "realizado",
  cancellation: null as null | { by: string; reason: string; observation: string },
};

const STATUS_FLOW = [
  { id: 'solicitado', label: 'Solicitud enviada' },
  { id: 'aceptado', label: 'Aceptada' },
  { id: 'preparando', label: 'Preparando' },
  { id: 'programado', label: 'Programada' },
  { id: 'en_ruta', label: 'En ruta' },
  { id: 'entregado_productor', label: 'Entregada (productor)' },
  { id: 'confirmado_comprador', label: 'Confirmada (comprador)' },
];

const PAYMENT_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  contra_entrega: "Pago contra entrega",
  realizado: "Pago realizado",
};

const paymentBadge: Record<string, "warning" | "neutral" | "success"> = {
  pendiente: "warning",
  contra_entrega: "neutral",
  realizado: "success",
};

const formatStatus = (status: string) => {
  if (status === 'cancelado') return 'Cancelado';
  const found = STATUS_FLOW.find(s => s.id === status);
  return found ? found.label : status;
};

export function AgreementDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = localStorage.getItem('userRole') || 'admin';

  const [agreement, setAgreement] = useState(mockAgreement);

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelObservation, setCancelObservation] = useState("");

  // Incidence state
  const [showIncidence, setShowIncidence] = useState(false);
  const [incidenceText, setIncidenceText] = useState("");
  const [incidenceSubmitted, setIncidenceSubmitted] = useState(false);

  // Chat messages
  const [messages, setMessages] = useState([
    { from: 'buyer', name: agreement.buyer, text: 'Hola, me gustaría confirmar si pueden dejármelo en Q115.00 ya que son 10 cajas.', time: '10:00 AM' },
    { from: 'producer', name: agreement.producer, text: 'Claro, ajustaremos el precio negociado a Q115.00. Lo prepararemos para el 24.', time: '10:45 AM' },
  ]);
  const [newMsg, setNewMsg] = useState("");

  const updateStatus = (newStatus: string) => {
    setAgreement(prev => ({ ...prev, status: newStatus }));
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) return;
    const by = role === 'admin' ? 'Administrador' : role === 'producer' ? agreement.producer : agreement.buyer;
    setAgreement(prev => ({
      ...prev,
      status: 'cancelado',
      cancellation: { by, reason: cancelReason, observation: cancelObservation },
    }));
    setShowCancelModal(false);
  };

  const handlePaymentChange = (ps: "pendiente" | "contra_entrega" | "realizado") => {
    setAgreement(prev => ({ ...prev, paymentStatus: ps }));
  };

  const handleSendMsg = () => {
    if (!newMsg.trim()) return;
    const fromRole = role === 'buyer' ? 'buyer' : 'producer';
    const name = role === 'buyer' ? agreement.buyer : role === 'producer' ? agreement.producer : 'Admin';
    setMessages(prev => [...prev, { from: fromRole, name, text: newMsg, time: 'Ahora' }]);
    setNewMsg("");
  };

  const handleIncidence = () => {
    if (!incidenceText.trim()) return;
    setIncidenceSubmitted(true);
    setTimeout(() => { setShowIncidence(false); setIncidenceSubmitted(false); }, 2500);
  };

  const currentIndex = STATUS_FLOW.findIndex(s => s.id === agreement.status);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900">Acuerdo #{agreement.id}</h1>
          <p className="text-gray-500 mt-1 text-lg">Seguimiento y detalle</p>
        </div>
        <Badge variant={agreement.status === 'cancelado' ? 'danger' : agreement.status === 'confirmado_comprador' ? 'success' : 'warning'} className="uppercase px-4 py-2 text-sm font-bold shadow-sm">
          {formatStatus(agreement.status)}
        </Badge>
      </header>

      {/* Tracking */}
      <Card className="mb-6 shadow-sm border-gray-100 overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" /> Seguimiento del Pedido
          </h3>

          {agreement.status === 'cancelado' ? (
            <div className="space-y-4">
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 font-semibold">
                <XCircle className="w-6 h-6" /> Este pedido ha sido cancelado.
              </div>
              {agreement.cancellation && (
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 space-y-2">
                  <p className="text-sm"><span className="font-bold text-gray-700">Cancelado por:</span> <span className="text-red-700">{agreement.cancellation.by}</span></p>
                  <p className="text-sm"><span className="font-bold text-gray-700">Motivo:</span> {agreement.cancellation.reason}</p>
                  {agreement.cancellation.observation && (
                    <p className="text-sm"><span className="font-bold text-gray-700">Observación:</span> {agreement.cancellation.observation}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="relative flex flex-col md:flex-row justify-between gap-4 md:gap-0 mt-4 md:mt-8">
              <div className="hidden md:block absolute top-4 left-6 right-6 h-1 bg-gray-200 rounded-full z-0" />
              <div className="md:hidden absolute top-0 bottom-0 left-[19px] w-1 bg-gray-200 rounded-full z-0" />

              {STATUS_FLOW.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                  <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2">
                    <div className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center border-4 shrink-0",
                      isCompleted ? "bg-green-600 border-green-200 text-white" : "bg-white border-gray-200 text-gray-400"
                    )}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                    </div>
                    <span className={clsx(
                      "text-sm font-bold md:text-center max-w-[100px]",
                      isCurrent ? "text-green-800" : isCompleted ? "text-gray-800" : "text-gray-400"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Final confirmation banner */}
          {agreement.status === 'confirmado_comprador' && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 font-semibold">
              <CheckCircle className="w-6 h-6" /> Entrega confirmada por ambas partes. Acuerdo completado.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main card */}
      <Card className="border-t-4 border-t-yellow-500 shadow-md">
        <CardContent className="p-0">
          <div className="p-6 md:p-8 space-y-8">
            {/* Parties */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-700" /> Productor
                </h3>
                <p className="text-2xl font-black text-gray-900 mb-2">{agreement.producer}</p>
                <p className="text-gray-600 text-lg"><span className="font-semibold">Tel:</span> {agreement.producerPhone}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-700" /> Comprador
                </h3>
                <p className="text-2xl font-black text-gray-900 mb-2">{agreement.buyer}</p>
                <p className="text-gray-600 text-lg"><span className="font-semibold">Tel:</span> {agreement.buyerPhone}</p>
              </div>
            </div>

            {/* Order details */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Box className="w-6 h-6 text-green-700" /> Detalles del Pedido
              </h3>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 grid grid-cols-2 gap-y-6">
                <div>
                  <p className="text-gray-500 font-medium mb-1 text-lg">Producto</p>
                  <p className="text-2xl font-black text-gray-900">{agreement.product}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1 text-lg">Cantidad</p>
                  <p className="text-2xl font-black text-gray-900">{agreement.qty}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1 text-lg">Precio Base (ref.)</p>
                  <p className="text-2xl font-black text-gray-400 line-through">{agreement.basePrice}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1 text-lg">Precio Negociado</p>
                  <p className="text-3xl font-black text-green-700">{agreement.negotiatedPrice}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1 text-lg">Fecha</p>
                  <p className="text-2xl font-black text-gray-900">{agreement.date}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1 text-lg">Estado de Pago</p>
                  <Badge variant={paymentBadge[agreement.paymentStatus]} className="text-sm px-3 py-1">
                    <Banknote className="w-4 h-4 mr-1 inline" />
                    {PAYMENT_LABELS[agreement.paymentStatus]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Payment status toggle (for producer/admin) */}
            {(role === 'producer' || role === 'admin') && agreement.status !== 'cancelado' && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-yellow-600" /> Registrar Estado de Pago
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(["pendiente", "contra_entrega", "realizado"] as const).map(ps => (
                    <button
                      key={ps}
                      onClick={() => handlePaymentChange(ps)}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-colors",
                        agreement.paymentStatus === ps ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {PAYMENT_LABELS[ps]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Logistics */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-orange-600" /> Logística
              </h3>
              <div className="space-y-4 bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                <div>
                  <p className="text-gray-500 font-medium mb-1 text-lg">Punto de Entrega</p>
                  <p className="text-xl font-bold text-gray-900">{agreement.location}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-1 text-lg">Observaciones</p>
                  <p className="text-lg text-gray-800">{agreement.notes}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-8 flex flex-col gap-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Acciones</h3>

              {/* Producer / Admin actions */}
              {(role === 'producer' || role === 'admin') && agreement.status !== 'cancelado' && agreement.status !== 'confirmado_comprador' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agreement.status === 'solicitado' && (
                      <>
                        <Button onClick={() => updateStatus('aceptado')} size="lg" className="w-full gap-2 text-lg h-16 shadow-sm">
                          <CheckCircle className="w-6 h-6" /> Aceptar Solicitud
                        </Button>
                        <Button onClick={() => setShowCancelModal(true)} variant="danger" size="lg" className="w-full gap-2 text-lg h-16 shadow-sm">
                          <XCircle className="w-6 h-6" /> Rechazar Solicitud
                        </Button>
                      </>
                    )}
                    {agreement.status === 'aceptado' && (
                      <Button onClick={() => updateStatus('preparando')} size="lg" className="w-full gap-2 text-lg h-16 shadow-sm md:col-span-2">
                        <Box className="w-6 h-6" /> Empezar a Preparar
                      </Button>
                    )}
                    {agreement.status === 'preparando' && (
                      <Button onClick={() => updateStatus('programado')} size="lg" className="w-full gap-2 text-lg h-16 shadow-sm md:col-span-2">
                        <Calendar className="w-6 h-6" /> Programar Entrega
                      </Button>
                    )}
                    {agreement.status === 'programado' && (
                      <Button onClick={() => updateStatus('en_ruta')} size="lg" className="w-full gap-2 text-lg h-16 shadow-sm md:col-span-2">
                        <Truck className="w-6 h-6" /> Iniciar Ruta
                      </Button>
                    )}
                    {agreement.status === 'en_ruta' && (
                      <Button onClick={() => updateStatus('entregado_productor')} size="lg" className="w-full gap-2 text-lg h-16 shadow-sm md:col-span-2 bg-green-700 hover:bg-green-800 text-white">
                        <CheckCircle className="w-6 h-6" /> Marcar como Entregada
                      </Button>
                    )}
                    {agreement.status === 'entregado_productor' && role === 'producer' && (
                      <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm font-semibold">
                        Esperando confirmación de recepción por parte del comprador...
                      </div>
                    )}
                  </div>

                  {agreement.status !== 'solicitado' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentIndex > 0) updateStatus(STATUS_FLOW[currentIndex - 1].id);
                      }}
                      className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-dashed"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Deshacer cambio de estado
                    </Button>
                  )}
                </div>
              )}

              {/* Admin extras */}
              {role === 'admin' && (
                <div className="mt-2 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" size="lg" className="w-full gap-2 text-lg h-16 shadow-sm md:col-span-2" onClick={() => setShowIncidence(true)}>
                    <AlertTriangle className="w-6 h-6" /> Resolver Incidencia
                  </Button>
                  {agreement.status !== 'cancelado' && (
                    <Button onClick={() => setShowCancelModal(true)} variant="danger" size="lg" className="w-full gap-2 text-lg h-16 shadow-sm md:col-span-2">
                      <XCircle className="w-6 h-6" /> Forzar Cancelación
                    </Button>
                  )}
                </div>
              )}

              {/* Buyer actions */}
              {role === 'buyer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(agreement.status === 'entregado_productor') && (
                    <Button onClick={() => updateStatus('confirmado_comprador')} size="lg" className="w-full gap-2 text-lg h-16 shadow-sm md:col-span-2 bg-green-700 hover:bg-green-800 text-white">
                      <CheckCircle className="w-6 h-6" /> Confirmar Recepción
                    </Button>
                  )}

                  {(agreement.status === 'entregado_productor' || agreement.status === 'confirmado_comprador') && (
                    <Button variant="outline" size="lg" className="w-full gap-2 text-lg h-16 shadow-sm md:col-span-2 border-red-200 text-red-700 hover:bg-red-50" onClick={() => setShowIncidence(true)}>
                      <AlertTriangle className="w-6 h-6" /> Reportar Inconformidad
                    </Button>
                  )}

                  {(agreement.status === 'solicitado' || agreement.status === 'aceptado') && (
                    <Button onClick={() => setShowCancelModal(true)} variant="danger" size="lg" className="w-full gap-2 text-lg h-16 shadow-sm md:col-span-2 mt-2">
                      <XCircle className="w-6 h-6" /> Cancelar Solicitud
                    </Button>
                  )}

                  {agreement.status === 'en_ruta' && (
                    <div className="md:col-span-2 bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-800 text-sm font-semibold">
                      El pedido va en camino. Podrás confirmar la recepción cuando el productor marque la entrega.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cancellation modal */}
            {showCancelModal && (
              <div className="border-t border-gray-200 pt-6">
                <Card className="border-red-200 bg-red-50/30">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
                      <XCircle className="w-6 h-6" /> Cancelar Acuerdo
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Motivo de cancelación *</Label>
                        <select
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="flex h-14 w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-lg"
                          required
                        >
                          <option value="">Seleccionar motivo...</option>
                          <option value="No puede cumplir con la cantidad">No puede cumplir con la cantidad</option>
                          <option value="Problema con el precio">Problema con el precio</option>
                          <option value="Producto no disponible">Producto no disponible</option>
                          <option value="Cambio de planes del comprador">Cambio de planes del comprador</option>
                          <option value="Incumplimiento de entrega">Incumplimiento de entrega</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Observación o justificación</Label>
                        <Textarea
                          placeholder="Explique brevemente..."
                          value={cancelObservation}
                          onChange={(e) => setCancelObservation(e.target.value)}
                          className="resize-none h-20"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => setShowCancelModal(false)} className="flex-1">
                        Volver
                      </Button>
                      <Button variant="danger" onClick={handleCancel} className="flex-1" disabled={!cancelReason.trim()}>
                        Confirmar Cancelación
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Incidence modal */}
            {showIncidence && (
              <div className="border-t border-gray-200 pt-6">
                <Card className="border-orange-200 bg-orange-50/30">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-orange-800 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6" /> {role === 'admin' ? 'Resolver Incidencia' : 'Reportar Inconformidad'}
                    </h3>
                    {incidenceSubmitted ? (
                      <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-2 font-semibold">
                        <CheckCircle className="w-5 h-5" /> {role === 'admin' ? 'Incidencia resuelta y registrada.' : 'Reporte enviado a la Asociación para revisión.'}
                      </div>
                    ) : (
                      <>
                        <Textarea
                          placeholder={role === 'admin' ? 'Describa la resolución aplicada...' : 'Describa el problema con la entrega o el producto...'}
                          value={incidenceText}
                          onChange={(e) => setIncidenceText(e.target.value)}
                          className="resize-none h-24"
                        />
                        <div className="flex gap-3">
                          <Button variant="ghost" onClick={() => setShowIncidence(false)} className="flex-1">Cancelar</Button>
                          <Button onClick={handleIncidence} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" disabled={!incidenceText.trim()}>
                            {role === 'admin' ? 'Registrar Resolución' : 'Enviar Reporte'}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Chat */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-600" /> Mensajes y Negociación
              </h3>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-6 space-y-4">
                <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-2">
                  {messages.map((msg, i) => (
                    <div key={i} className={clsx("flex flex-col gap-1 max-w-[85%]", msg.from === 'buyer' ? "items-start" : "items-end self-end")}>
                      <div className={clsx(
                        "p-3 rounded-2xl shadow-sm",
                        msg.from === 'buyer' ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm" : "bg-green-100 border border-green-200 text-gray-900 rounded-tr-sm"
                      )}>
                        <p className={clsx("text-sm font-bold mb-1", msg.from === 'buyer' ? "text-gray-500" : "text-green-700")}>
                          {msg.name} ({msg.from === 'buyer' ? 'Comprador' : 'Productor'})
                        </p>
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {agreement.status !== 'cancelado' && role !== 'guest' && (
                  <div className="pt-4 border-t border-gray-200 flex gap-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      className="flex-1"
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMsg()}
                    />
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