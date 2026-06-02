// PATRÓN: Adapter — encapsula `fetch` detrás de una interfaz estable.
// Maneja la URL base, el token Bearer, los errores y los reintentos.
// El resto del frontend consume `api.<verb>(path, body)` sin saber qué
// transporte hay debajo (RNF27).

import { getToken, clearSession } from './auth';

const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
  }
}

type ReqInit = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** No enviar el token Bearer (endpoints públicos). */
  anonymous?: boolean;
  /** Cantidad de reintentos para errores transitorios (5xx, red). */
  retries?: number;
};

async function request<T = unknown>(path: string, init: ReqInit = {}): Promise<T> {
  const { method = 'GET', body, query, anonymous = false, retries = 1 } = init;

  // Construye la URL con query string.
  const url = new URL(`${BASE_URL}/api${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!anonymous) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (res.status === 401 && !anonymous) {
        clearSession();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login');
        }
        throw new ApiError(401, 'Sesión expirada o inválida');
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(' • ')
          : data?.message ?? `HTTP ${res.status}`;
        throw new ApiError(res.status, message, data);
      }
      return data as T;
    } catch (err) {
      lastErr = err;
      // Sólo reintentamos errores de red (fetch lanza TypeError) — no errores HTTP.
      if (err instanceof ApiError) throw err;
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  throw lastErr;
}

export const api = {
  get: <T = unknown>(path: string, init?: Omit<ReqInit, 'method'>) =>
    request<T>(path, { ...init, method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown, init?: Omit<ReqInit, 'method' | 'body'>) =>
    request<T>(path, { ...init, method: 'POST', body }),
  patch: <T = unknown>(path: string, body?: unknown, init?: Omit<ReqInit, 'method' | 'body'>) =>
    request<T>(path, { ...init, method: 'PATCH', body }),
  put: <T = unknown>(path: string, body?: unknown, init?: Omit<ReqInit, 'method' | 'body'>) =>
    request<T>(path, { ...init, method: 'PUT', body }),
  delete: <T = unknown>(path: string, body?: unknown, init?: Omit<ReqInit, 'method' | 'body'>) =>
    request<T>(path, { ...init, method: 'DELETE', body }),
};

export const API_BASE_URL = BASE_URL;
