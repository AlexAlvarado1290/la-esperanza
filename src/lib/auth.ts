// Estado de sesión (JWT + usuario) persistido en localStorage para sobrevivir
// recargas. Expone hooks y helpers para que el resto del frontend nunca toque
// localStorage directamente. Cuando cambia la sesión emite un evento storage
// sintético para que cualquier componente suscrito vía useAuth se actualice.

import { useEffect, useState } from 'react';
import type { AuthUser, BackendRol, LegacyRole } from './types';

const TOKEN_KEY = 'esperanza.token';
const USER_KEY = 'esperanza.user';
const EVENT_NAME = 'esperanza:auth-changed';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Compatibilidad con el código legado (Layout aún lee 'userRole').
  localStorage.setItem('userRole', backendRoleToLegacy(user.rol));
  localStorage.setItem('userName', user.nombreCompleto);
  localStorage.setItem('userPhone', user.telefono);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem('userRole', backendRoleToLegacy(user.rol));
  localStorage.setItem('userName', user.nombreCompleto);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userPhone');
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function setGuest() {
  clearSession();
  localStorage.setItem('userRole', 'guest');
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function backendRoleToLegacy(rol: BackendRol): LegacyRole {
  switch (rol) {
    case 'ADMIN':
      return 'admin';
    case 'PRODUCTOR':
      return 'producer';
    case 'COMPRADOR':
      return 'buyer';
  }
}

export function useAuth() {
  const [state, setState] = useState<{
    token: string | null;
    user: AuthUser | null;
  }>(() => ({ token: getToken(), user: getUser() }));

  useEffect(() => {
    const sync = () => setState({ token: getToken(), user: getUser() });
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return state;
}

export function useRole(): LegacyRole {
  const { user } = useAuth();
  if (user) return backendRoleToLegacy(user.rol);
  // Si no hay user pero quedó marcado como guest, respetar.
  try {
    return (localStorage.getItem('userRole') as LegacyRole) ?? 'guest';
  } catch {
    return 'guest';
  }
}
