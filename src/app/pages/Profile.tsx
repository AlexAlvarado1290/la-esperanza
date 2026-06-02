import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, Lock, User, Phone, MapPin, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, Card, CardContent, Input, Label } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import { useAuth, setUser } from "../../lib/auth";
import type { AuthUser } from "../../lib/types";

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState(user?.nombreCompleto ?? "");
  const [location, setLocation] = useState(user?.direccion ?? "");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showChangePin, setShowChangePin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.nombreCompleto);
      setLocation(user.direccion ?? "");
    }
  }, [user?.idUsuario]);

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        Inicia sesión para ver tu perfil.
      </div>
    );
  }

  const pinLength = user.pinLength;
  const typeLabel =
    user.rol === "ADMIN"
      ? "Administrador / Asociación"
      : user.rol === "PRODUCTOR"
        ? "Productor Agrícola"
        : "Comprador";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);
    try {
      const updated = await api.patch<AuthUser>("/auth/profile", {
        nombreCompleto: name,
        direccion: location,
      });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    if (currentPin.length !== pinLength) {
      setPinError(`Ingresa tu PIN actual (${pinLength} dígitos).`);
      return;
    }
    if (newPin.length !== pinLength) {
      setPinError(`El nuevo PIN debe tener ${pinLength} dígitos.`);
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("Los PINs no coinciden.");
      return;
    }
    if (newPin === currentPin) {
      setPinError("El nuevo PIN debe ser diferente al actual.");
      return;
    }
    try {
      await api.patch("/auth/change-pin", { currentPin, newPin });
      setPinSuccess(true);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      // Refrescar el user para reflejar mustChangePin=false.
      const me = await api.get<AuthUser>("/auth/me");
      setUser(me);
      setTimeout(() => {
        setPinSuccess(false);
        setShowChangePin(false);
      }, 2500);
    } catch (err) {
      setPinError(err instanceof ApiError ? err.message : "Error al cambiar PIN.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-500 mt-1 text-lg">Información personal</p>
        </div>
      </header>

      <Card className="border-green-100 shadow-md">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" /> Datos protegidos — no se pueden modificar
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500">ID del Sistema</Label>
                  <div className="h-12 bg-gray-100 rounded-xl flex items-center px-4 text-lg font-bold text-gray-500">
                    #{user.idUsuario}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500">Tipo de Usuario</Label>
                  <div className="h-12 bg-gray-100 rounded-xl flex items-center px-4 text-lg font-bold text-gray-500">
                    {typeLabel}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500">Estado de Cuenta</Label>
                  <div className="h-12 bg-gray-100 rounded-xl flex items-center px-4 text-lg font-bold text-gray-500">
                    {user.estadoCuenta}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-gray-500">Teléfono Principal</Label>
                  <div className="h-12 bg-gray-100 rounded-xl flex items-center gap-2 px-4 text-lg font-bold text-gray-500">
                    <Phone className="w-4 h-4" /> {user.telefono}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-green-700" /> Nombre Completo
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-3">
              <Label htmlFor="location" className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-700" /> Dirección o Comunidad
              </Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            {saveError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
                <AlertCircle className="w-5 h-5" /> {saveError}
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" disabled={saving} size="lg" className="w-full gap-2 text-lg">
                <Save className="w-6 h-6" /> {saving ? "Guardando…" : "Guardar Cambios"}
              </Button>
              {saved && (
                <div className="mt-3 bg-green-50 text-green-700 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5" /> Perfil actualizado correctamente.
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-md border-gray-100">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-600" /> Seguridad
            </h3>
          </div>

          {!showChangePin ? (
            <Button
              variant="outline"
              onClick={() => setShowChangePin(true)}
              className="w-full gap-2 text-lg h-14 border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              <Lock className="w-5 h-5" /> Cambiar mi PIN de acceso ({pinLength} dígitos)
            </Button>
          ) : (
            <form onSubmit={handleChangePin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base">PIN Actual</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={pinLength}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-[0.5em] font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Nuevo PIN ({pinLength} dígitos)</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={pinLength}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-[0.5em] font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Confirmar Nuevo PIN</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={pinLength}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-[0.5em] font-bold"
                  required
                />
              </div>
              {pinError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold">{pinError}</div>
              )}
              {pinSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5" /> PIN actualizado exitosamente.
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowChangePin(false);
                    setPinError("");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                  Actualizar PIN
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
