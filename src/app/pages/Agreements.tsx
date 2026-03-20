import { useState } from "react";
import { Link } from "react-router";
import { Calendar, ChevronRight, Banknote } from "lucide-react";
import { Card, CardContent, Badge } from "../components/ui";

type AgreementStatus = "solicitado" | "aceptado" | "preparando" | "programado" | "en_ruta" | "entregado_productor" | "confirmado_comprador" | "cancelado";

interface Agreement {
  id: string;
  producer: string;
  buyer: string;
  product: string;
  qty: string;
  price: string;
  status: AgreementStatus;
  date: string;
  paymentStatus: "pendiente" | "contra_entrega" | "realizado";
}

const agreements: Agreement[] = [
  { id: "AC-101", producer: "Juan Pérez", buyer: "Restaurante El Sabor", product: "Papas Super Chola", qty: "10 Quintales", price: "Q240.00", status: "solicitado", date: "2026-03-25", paymentStatus: "pendiente" },
  { id: "AC-102", producer: "Asociación San José", buyer: "Mercado Central", product: "Tomate Riñón", qty: "20 Cajas", price: "Q230.00", status: "aceptado", date: "2026-03-22", paymentStatus: "contra_entrega" },
  { id: "AC-103", producer: "María Gómez", buyer: "Supermercado XYZ", product: "Maíz Amarillo", qty: "50 Quintales", price: "Q900.00", status: "confirmado_comprador", date: "2026-03-18", paymentStatus: "realizado" },
  { id: "AC-104", producer: "Luis Cando", buyer: "Restaurante El Sabor", product: "Cebolla Blanca", qty: "5 Sacos", price: "Q75.00", status: "cancelado", date: "2026-03-15", paymentStatus: "pendiente" },
  { id: "AC-105", producer: "Asociación San José", buyer: "Mercado Sur", product: "Tomate Riñón", qty: "10 Cajas", price: "Q115.00", status: "en_ruta", date: "2026-03-24", paymentStatus: "contra_entrega" },
  { id: "AC-106", producer: "Juan Pérez", buyer: "Mercado Central", product: "Fréjol Canario", qty: "8 Quintales", price: "Q176.00", status: "entregado_productor", date: "2026-03-23", paymentStatus: "pendiente" },
];

const statusColors: Record<AgreementStatus, "warning" | "neutral" | "success" | "danger"> = {
  solicitado: "warning",
  aceptado: "neutral",
  preparando: "neutral",
  programado: "neutral",
  en_ruta: "warning",
  entregado_productor: "warning",
  confirmado_comprador: "success",
  cancelado: "danger",
};

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    solicitado: "Solicitud enviada",
    aceptado: "Aceptada",
    preparando: "Preparando",
    programado: "Programada",
    en_ruta: "En ruta",
    entregado_productor: "Entregada (productor)",
    confirmado_comprador: "Confirmada ✓",
    cancelado: "Cancelado",
  };
  return map[status] || status;
};

const paymentLabel: Record<string, string> = {
  pendiente: "Pago pendiente",
  contra_entrega: "Contra entrega",
  realizado: "Pagado",
};

type FilterTab = "todos" | "pendientes" | "proceso" | "completados" | "cancelados";

export function AgreementsList() {
  const role = localStorage.getItem('userRole') || 'admin';
  const [activeTab, setActiveTab] = useState<FilterTab>("todos");

  let title = "Supervisión de Acuerdos";
  let subtitle = "Seguimiento general de acuerdos y entregas";

  if (role === 'buyer') {
    title = "Mis Compras";
    subtitle = "Estado de tus solicitudes y pedidos";
  } else if (role === 'producer') {
    title = "Mis Acuerdos";
    subtitle = "Solicitudes recibidas y ventas";
  }

  const filtered = agreements.filter(a => {
    if (activeTab === "todos") return true;
    if (activeTab === "pendientes") return a.status === "solicitado";
    if (activeTab === "proceso") return ["aceptado", "preparando", "programado", "en_ruta", "entregado_productor"].includes(a.status);
    if (activeTab === "completados") return a.status === "confirmado_comprador";
    if (activeTab === "cancelados") return a.status === "cancelado";
    return true;
  });

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
        {tabs.map(tab => (
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

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-lg">No hay acuerdos en esta categoría.</div>
        ) : (
          filtered.map((agr) => (
            <Link to={`/agreements/${agr.id}`} key={agr.id}>
              <Card className="hover:border-green-500 active:scale-[0.99] transition-all cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-start mr-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={statusColors[agr.status]} className="uppercase tracking-wide text-xs">
                          {formatStatus(agr.status)}
                        </Badge>
                        <Badge variant={agr.paymentStatus === 'realizado' ? 'success' : agr.paymentStatus === 'contra_entrega' ? 'neutral' : 'warning'} className="text-xs flex items-center gap-1">
                          <Banknote className="w-3 h-3" /> {paymentLabel[agr.paymentStatus]}
                        </Badge>
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
          ))
        )}
      </div>
    </div>
  );
}