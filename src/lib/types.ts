// Tipos compartidos con el backend (espejo del schema Prisma).

export type BackendRol = 'ADMIN' | 'PRODUCTOR' | 'COMPRADOR';
export type LegacyRole = 'admin' | 'producer' | 'buyer' | 'guest';
export type EstadoCuenta = 'ACTIVO' | 'SUSPENDIDO' | 'BLOQUEADO';
export type EstadoMaestro = 'ACTIVO' | 'INACTIVO';
export type EstadoProducto = 'DISPONIBLE' | 'AGOTADO' | 'RETIRADO';
export type EstadoSolicitud = 'SOLICITADO' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA';
export type EstadoAcuerdo =
  | 'SOLICITADO'
  | 'ACEPTADO'
  | 'PREPARANDO'
  | 'PROGRAMADO'
  | 'EN_RUTA'
  | 'ENTREGADO_PRODUCTOR'
  | 'CONFIRMADO_COMPRADOR'
  | 'CANCELADO'
  | 'INCIDENCIA'
  | 'RESUELTA_CONFIRMADA'
  | 'RESUELTA_DESCARTADA'
  | 'INCUMPLIDA_POR_TIEMPO';
export type EstadoPago = 'PENDIENTE' | 'CONTRA_ENTREGA' | 'REALIZADO';
export type EstadoFinal = 'CONFIRMADA' | 'INCUMPLIDA' | 'CANCELADA' | null;
export type TipoReporte =
  | 'INCONFORMIDAD_CANTIDAD'
  | 'INCONFORMIDAD_CALIDAD'
  | 'INCUMPLIMIENTO_ENTREGA'
  | 'OTRO';
export type EstadoReporte = 'ABIERTO' | 'EN_REVISION' | 'RESUELTO' | 'DESCARTADO';

export interface AuthUser {
  idUsuario: number;
  telefono: string;
  nombreCompleto: string;
  direccion: string | null;
  rol: BackendRol;
  estadoCuenta: EstadoCuenta;
  mustChangePin: boolean;
  pinLength: number;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
  estado: EstadoMaestro;
}

export interface Unidad {
  idUnidad: number;
  nombre: string;
  abreviatura: string;
  descripcion: string | null;
  estado: EstadoMaestro;
}

export interface PuntoEntrega {
  idPuntoEntrega: number;
  nombre: string;
  descripcion: string | null;
  referencia: string | null;
  estado: EstadoMaestro;
}

export interface Producto {
  idProducto: number;
  idProductor: number;
  idCategoria: number;
  idUnidad: number;
  nombre: string;
  descripcion: string | null;
  cantidadDisponible: string; // Prisma Decimal → string
  precioReferencial: string;
  estadoProducto: EstadoProducto;
  fechaPublicacion: string;
  categoria: Categoria;
  unidad: Unidad;
  productor: { idUsuario: number; nombreCompleto: string };
}

export interface UsuarioAdmin {
  idUsuario: number;
  cui: string;
  nombreCompleto: string;
  telefono: string;
  direccion: string | null;
  estadoCuenta: EstadoCuenta;
  mustChangePin: boolean;
  fechaRegistro: string;
  rol: { idRol: number; nombre: BackendRol };
  indicadores?: { entregasCompletadas: number; reportesRecibidos: number };
}

export interface Solicitud {
  idSolicitud: number;
  idComprador: number;
  idProducto: number;
  cantidadSolicitada: string;
  mensajeInicial: string | null;
  estadoSolicitud: EstadoSolicitud;
  fechaSolicitud: string;
  motivoRechazo: string | null;
  producto?: Producto;
  comprador?: { idUsuario: number; nombreCompleto: string; telefono: string };
  acuerdo?: Acuerdo | null;
}

export interface SeguimientoEntrega {
  idSeguimiento: number;
  idAcuerdo: number;
  idUsuario: number;
  estado: EstadoAcuerdo;
  comentario: string | null;
  fechaHora: string;
  usuario?: { idUsuario: number; nombreCompleto: string };
}

export interface MensajeAcuerdo {
  idMensaje: number;
  idAcuerdo: number;
  idRemitente: number;
  mensaje: string;
  fechaHora: string;
  remitente?: { idUsuario: number; nombreCompleto: string };
}

export interface Acuerdo {
  idAcuerdo: number;
  idSolicitud: number;
  idPuntoEntrega: number;
  precioFinal: string;
  cantidadAcordada: string;
  fechaProgramada: string;
  fechaEntregaProductor: string | null;
  fechaConfirmacionComprador: string | null;
  estadoAcuerdo: EstadoAcuerdo;
  estadoPago: EstadoPago;
  estadoFinal: EstadoFinal;
  justificacionIncumplimiento: string | null;
  observaciones: string | null;
  puntoEntrega?: PuntoEntrega;
  solicitud?: Solicitud;
  seguimientos?: SeguimientoEntrega[];
  mensajes?: MensajeAcuerdo[];
}

export interface Notificacion {
  idNotificacion: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  payload: Record<string, unknown> | null;
}
