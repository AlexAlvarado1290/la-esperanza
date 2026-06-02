import { useState } from "react";
import { useNavigate } from "react-router";
import { Sprout, Phone, Lock, AlertCircle, KeyRound } from "lucide-react";
import { Button, Card, CardContent, Input, Label } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import { setSession, setGuest, setUser } from "../../lib/auth";
import type { AuthUser, LoginResponse } from "../../lib/types";

export function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estado para el cambio obligatorio de PIN en el primer login (RF26).
  const [mustChange, setMustChange] = useState<null | { user: AuthUser; token: string }>(null);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [changing, setChanging] = useState(false);

  // RF05 — Olvidé mi PIN: pantalla auxiliar que pide el teléfono y dispara
  // el envío de un PIN temporal por SMS. El backend siempre responde el mismo
  // mensaje (registrado o no) para evitar enumeración de cuentas.
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotSending, setForgotSending] = useState(false);

  const handleForgotPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(null);
    setForgotSending(true);
    try {
      const res = await api.post<{ message: string }>(
        "/auth/forgot-pin",
        { telefono: forgotPhone },
        { anonymous: true },
      );
      setForgotMessage(res.message);
    } catch (err) {
      if (err instanceof ApiError) setForgotMessage(err.message);
      else setForgotMessage("No se pudo procesar la solicitud. Intenta más tarde.");
    } finally {
      setForgotSending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/auth/login", { telefono: phone, pin }, { anonymous: true });
      if (res.user.mustChangePin) {
        // Guardamos el token para usarlo en /auth/change-pin, pero no marcamos
        // sesión completa hasta que se cambie.
        setSession(res.access_token, res.user);
        setMustChange({ user: res.user, token: res.access_token });
        return;
      }
      setSession(res.access_token, res.user);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("No se pudo conectar al servidor. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mustChange) return;
    setError(null);
    const requiredLength = mustChange.user.pinLength;
    if (newPin.length !== requiredLength) {
      setError(`El PIN nuevo debe tener exactamente ${requiredLength} dígitos.`);
      return;
    }
    if (newPin !== confirmPin) {
      setError("La confirmación no coincide.");
      return;
    }
    if (newPin === pin) {
      setError("El PIN nuevo debe ser distinto al actual.");
      return;
    }
    setChanging(true);
    try {
      await api.patch("/auth/change-pin", { currentPin: pin, newPin });
      const me = await api.get<AuthUser>("/auth/me");
      setUser(me);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("No se pudo cambiar el PIN.");
    } finally {
      setChanging(false);
    }
  };

  if (mustChange) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="bg-orange-100 p-6 rounded-full mb-6 shadow-sm">
            <KeyRound className="w-16 h-16 text-orange-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">Cambia tu PIN</h1>
          <p className="text-gray-500 text-center mb-8 text-lg">
            Por seguridad debes definir un PIN nuevo de {mustChange.user.pinLength} dígitos.
          </p>
          <Card className="w-full shadow-lg border-gray-100 bg-white">
            <CardContent className="pt-8 pb-8 space-y-6">
              <form onSubmit={handleChangePin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-lg">PIN nuevo ({mustChange.user.pinLength} dígitos)</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={mustChange.user.pinLength}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                    className="h-14 text-2xl tracking-[0.5em] font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-lg">Confirmar PIN</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={mustChange.user.pinLength}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                    className="h-14 text-2xl tracking-[0.5em] font-bold"
                    required
                  />
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
                <Button type="submit" disabled={changing} className="w-full h-16 text-xl mt-4 bg-green-700 hover:bg-green-800 text-white shadow-md">
                  {changing ? "Guardando…" : "Cambiar PIN"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="bg-green-100 p-6 rounded-full mb-6 shadow-sm">
          <Sprout className="w-16 h-16 text-green-700" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">La Esperanza</h1>
        <p className="text-gray-500 text-center mb-8 text-lg">Comunidad Agrícola Rural</p>

        <Card className="w-full shadow-lg border-gray-100 bg-white">
          <CardContent className="pt-8 pb-8 space-y-6">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Iniciar Sesión</h2>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-lg">Número de Celular</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ej. 0999999991"
                    className="pl-12 text-lg h-14"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-lg">PIN</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    minLength={4}
                    placeholder="Ingresa tu PIN"
                    className="pl-12 text-lg h-14"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  4 dígitos (productor o comprador) — 6 dígitos (administrador).
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-16 text-xl mt-4 bg-green-700 hover:bg-green-800 text-white shadow-md">
                {loading ? "Validando…" : "Ingresar"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => { setGuest(); navigate("/products"); }}
                className="w-full h-14 text-lg border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Ver catálogo sin cuenta
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(true);
                  setForgotPhone(phone);
                  setForgotMessage(null);
                }}
                className="w-full text-sm font-medium text-green-700 hover:text-green-800 underline-offset-4 hover:underline"
              >
                ¿Olvidaste tu PIN?
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-2">¿No tienes cuenta? Solicítala a la Asociación.</p>
          </CardContent>
        </Card>
      </div>

      {showForgot && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4"
          onClick={() => setShowForgot(false)}
        >
          <Card
            className="w-full max-w-sm bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="pt-6 pb-6 space-y-5">
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-100 p-4 rounded-full mb-3">
                  <KeyRound className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Recuperar PIN</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Te enviaremos un PIN temporal por SMS al número registrado.
                  Al iniciar sesión deberás cambiarlo.
                </p>
              </div>

              {forgotMessage ? (
                <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm">
                  {forgotMessage}
                </div>
              ) : (
                <form onSubmit={handleForgotPin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-phone" className="text-base">Número de celular</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="forgot-phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="Ej. 0999999991"
                        className="pl-12 text-lg h-12"
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={forgotSending || forgotPhone.length < 8}
                    className="w-full h-12 bg-green-700 hover:bg-green-800 text-white"
                  >
                    {forgotSending ? "Enviando…" : "Enviar PIN temporal"}
                  </Button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setForgotMessage(null);
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                {forgotMessage ? "Cerrar" : "Cancelar"}
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
