import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Edit2, Scale, CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, CardContent, Input, Label, Badge, Textarea } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import { useRole } from "../../lib/auth";
import type { Unidad } from "../../lib/types";

export function UnitsList() {
  const navigate = useNavigate();
  const role = useRole();
  const [units, setUnits] = useState<Unidad[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Unidad | null>(null);
  const [nombre, setNombre] = useState("");
  const [abreviatura, setAbreviatura] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await api.get<Unidad[]>("/master-data/units", { query: { all: "true" } });
      setUnits(data);
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
    setEditing(null); setNombre(""); setAbreviatura(""); setDescripcion(""); setShowForm(true);
  };
  const openEdit = (u: Unidad) => {
    setEditing(u); setNombre(u.nombre); setAbreviatura(u.abreviatura); setDescripcion(u.descripcion ?? ""); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await api.patch(`/master-data/units/${editing.idUnidad}`, { nombre, abreviatura, descripcion });
      } else {
        await api.post(`/master-data/units`, { nombre, abreviatura, descripcion });
      }
      setShowForm(false);
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al guardar.");
    }
  };

  const toggleEstado = async (u: Unidad) => {
    try {
      await api.patch(`/master-data/units/${u.idUnidad}`, {
        estado: u.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO",
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
          <h1 className="text-3xl font-extrabold text-gray-900">Unidades de Medida</h1>
          <p className="text-gray-500 mt-1 text-lg">Catálogo maestro para cuantificar productos</p>
        </div>
        <Button onClick={openNew} size="lg" className="gap-2">
          <Plus className="w-5 h-5" /> Nueva
        </Button>
      </header>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold">{error}</div>}

      {showForm && (
        <Card className="border-green-200 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-green-700" /> {editing ? "Editar Unidad" : "Nueva Unidad"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Abreviatura *</Label>
                  <Input value={abreviatura} onChange={(e) => setAbreviatura(e.target.value)} maxLength={6} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="h-20 resize-none" />
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
        {!loading && units.map((u) => (
          <Card key={u.idUnidad} className="hover:border-green-400">
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">
                    {u.nombre} <span className="text-gray-500 font-mono text-base">({u.abreviatura})</span>
                  </h2>
                  <Badge variant={u.estado === "ACTIVO" ? "success" : "danger"} className="text-xs uppercase">
                    {u.estado}
                  </Badge>
                </div>
                <p className="text-gray-600">{u.descripcion ?? "Sin descripción"}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(u)}>
                  <Edit2 className="w-4 h-4" /> Editar
                </Button>
                <Button
                  variant={u.estado === "ACTIVO" ? "danger" : "default"}
                  size="sm"
                  className="gap-1"
                  onClick={() => toggleEstado(u)}
                >
                  {u.estado === "ACTIVO" ? <><XCircle className="w-4 h-4" /> Desactivar</> : <><CheckCircle2 className="w-4 h-4" /> Activar</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
