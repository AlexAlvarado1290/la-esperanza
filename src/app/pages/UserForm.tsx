import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { UserPlus, Save, ArrowLeft, Info, CheckCircle2 } from "lucide-react";
import { Button, Card, CardContent, Input, Label } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import type { UsuarioAdmin } from "../../lib/types";

export function UserForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get("edit") === "true";
  const userId = searchParams.get("userId");

  const [tipo, setTipo] = useState<"PRODUCTOR" | "COMPRADOR">("PRODUCTOR");
  const [cui, setCui] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successAlta, setSuccessAlta] = useState<{ mensajeSms: string } | null>(null);

  useEffect(() => {
    if (!isEditing || !userId) return;
    (async () => {
      try {
        const u = await api.get<UsuarioAdmin>(`/users/${userId}`);
        setTipo(u.rol.nombre === "ADMIN" ? "PRODUCTOR" : (u.rol.nombre as any));
        setCui(u.cui);
        setNombre(u.nombreCompleto);
        setTelefono(u.telefono);
        setDireccion(u.direccion ?? "");
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "No se pudo cargar el usuario.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isEditing, userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isEditing && userId) {
        await api.patch(`/users/${userId}`, { nombreCompleto: nombre, direccion });
        navigate("/users");
      } else {
        const res = await api.post<{ mensajeSms: string }>("/users", {
          cui, nombreCompleto: nombre, telefono, direccion: direccion || undefined, rol: tipo,
        });
        setSuccessAlta(res);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-500">Cargando…</p>;

  if (successAlta) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
        <h2 className="text-2xl font-bold">Usuario creado</h2>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-left space-y-1">
          <p className="text-sm text-blue-900 font-semibold">SMS enviado al teléfono registrado</p>
          <p className="text-xs text-blue-800">{successAlta.mensajeSms}</p>
          <p className="text-xs text-blue-700 mt-2">Por seguridad, el PIN solo lo recibe el usuario por SMS. El sistema no lo muestra a la administración.</p>
        </div>
        <Button onClick={() => navigate("/users")} size="lg">Volver a la lista</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{isEditing ? "Editar Usuario" : "Alta de Usuario"}</h1>
          <p className="text-gray-500 mt-1 text-lg">{isEditing ? "Modificar datos del usuario" : "Registro por parte de la Asociación"}</p>
        </div>
      </header>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          {isEditing
            ? 'Los campos protegidos (DPI, teléfono, tipo) no pueden modificarse. Usa "Reiniciar PIN" desde la lista de usuarios si es necesario.'
            : 'El sistema generará un PIN aleatorio (4 dígitos productor/comprador, 6 dígitos administrador) y se lo enviará por SMS al teléfono registrado. Por seguridad, ni siquiera la administración puede verlo. El usuario deberá cambiarlo al primer ingreso.'}
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold">{error}</div>}

      <Card className="border-green-100 shadow-md">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="type" className="text-lg">Tipo de Usuario</Label>
              <select
                id="type"
                className="flex h-14 w-full rounded-xl border-2 border-gray-300 bg-transparent px-4 py-2 text-lg transition-colors focus-visible:outline-none focus-visible:border-green-600 disabled:bg-gray-100 disabled:text-gray-500"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                required
                disabled={isEditing}
              >
                <option value="PRODUCTOR">Productor Agrícola</option>
                <option value="COMPRADOR">Comprador</option>
              </select>
              {isEditing && <p className="text-xs text-gray-400">El tipo de usuario no se puede modificar.</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="dpi" className="text-lg">DPI / CUI</Label>
              <Input id="dpi" placeholder="Ej: 1234567890101" required value={cui} onChange={(e) => setCui(e.target.value)} disabled={isEditing} className={isEditing ? "bg-gray-100 text-gray-500" : ""} />
              {isEditing && <p className="text-xs text-gray-400">El número de identificación no se puede modificar.</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg">Nombre Completo o Empresa</Label>
              <Input id="name" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-lg">Teléfono (será su usuario de acceso)</Label>
              <Input id="phone" type="tel" placeholder="Ej: 0987654321" required value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))} disabled={isEditing} className={isEditing ? "bg-gray-100 text-gray-500" : ""} />
              {isEditing && <p className="text-xs text-gray-400">El teléfono principal no se puede modificar.</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="location" className="text-lg">Dirección o Comunidad</Label>
              <Input id="location" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>

            <div className="pt-6">
              <Button type="submit" disabled={saving} size="lg" className="w-full gap-2 text-xl py-6">
                {isEditing ? <Save className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                {saving ? "Guardando…" : isEditing ? "Guardar Cambios" : "Registrar Usuario"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
