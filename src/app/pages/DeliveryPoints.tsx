import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Edit2, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, CardContent, Input, Label, Badge, Textarea } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import { useRole } from "../../lib/auth";
import type { PuntoEntrega } from "../../lib/types";

export function DeliveryPointsList() {
  const navigate = useNavigate();
  const role = useRole();
  const [points, setPoints] = useState<PuntoEntrega[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PuntoEntrega | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await api.get<PuntoEntrega[]>("/master-data/delivery-points", { query: { all: "true" } });
      setPoints(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") reload();
    else setLoading(false);
  }, [role]);

  if (role !== "admin") {
    return <div className="text-center py-20 text-gray-500 text-lg">Esta sección es exclusiva de la Asociación.</div>;
  }

  const openNew = () => {
    setEditing(null); setNombre(""); setDescripcion(""); setReferencia(""); setShowForm(true);
  };
  const openEdit = (p: PuntoEntrega) => {
    setEditing(p); setNombre(p.nombre); setDescripcion(p.descripcion ?? ""); setReferencia(p.referencia ?? ""); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await api.patch(`/master-data/delivery-points/${editing.idPuntoEntrega}`, { nombre, descripcion, referencia });
      } else {
        await api.post(`/master-data/delivery-points`, { nombre, descripcion, referencia });
      }
      setShowForm(false);
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al guardar.");
    }
  };

  const toggleEstado = async (p: PuntoEntrega) => {
    try {
      await api.patch(`/master-data/delivery-points/${p.idPuntoEntrega}`, {
        estado: p.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
      });
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al cambiar estado.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900">Puntos de Entrega</h1>
          <p className="text-gray-500 mt-1 text-lg">Lugares oficiales de intercambio acordados por la comunidad</p>
        </div>
        <Button onClick={openNew} size="lg" className="gap-2">
          <Plus className="w-5 h-5" /> Nuevo
        </Button>
      </header>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold">{error}</div>}

      {showForm && (
        <Card className="border-green-200 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-700" /> {editing ? "Editar Punto de Entrega" : "Nuevo Punto de Entrega"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="h-20 resize-none" />
              </div>
              <div className="space-y-2">
                <Label>Referencia / Cómo llegar</Label>
                <Input value={referencia} onChange={(e) => setReferencia(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
                <Button type="submit" className="flex-1">{editing ? "Guardar cambios" : "Registrar"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {loading && <p className="text-center text-gray-500 py-8">Cargando…</p>}
        {!loading && points.map((p) => (
          <Card key={p.idPuntoEntrega} className="hover:border-green-400">
            <CardContent className="p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-600" /> {p.nombre}
                  </h2>
                  <Badge variant={p.estado === "ACTIVO" ? "success" : "danger"} className="text-xs uppercase">
                    {p.estado}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-1">{p.descripcion ?? "Sin descripción"}</p>
                {p.referencia && (
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Referencia:</span> {p.referencia}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(p)}>
                  <Edit2 className="w-4 h-4" /> Editar
                </Button>
                <Button
                  variant={p.estado === "ACTIVO" ? "danger" : "default"}
                  size="sm"
                  className="gap-1"
                  onClick={() => toggleEstado(p)}
                >
                  {p.estado === "ACTIVO" ? <><XCircle className="w-4 h-4" /> Desactivar</> : <><CheckCircle2 className="w-4 h-4" /> Activar</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
