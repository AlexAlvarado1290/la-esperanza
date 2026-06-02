import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { Button, Card, CardContent, Input, Label, Textarea } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import type { Categoria, Producto, Unidad } from "../../lib/types";

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Categoria[]>([]);
  const [units, setUnits] = useState<Unidad[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idCategoria, setIdCategoria] = useState<number | "">("");
  const [idUnidad, setIdUnidad] = useState<number | "">("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cats, uns] = await Promise.all([
          api.get<Categoria[]>("/master-data/categories"),
          api.get<Unidad[]>("/master-data/units"),
        ]);
        setCategories(cats);
        setUnits(uns);
        if (isEditing && id) {
          const p = await api.get<Producto>(`/catalog/products/${id}`);
          setNombre(p.nombre);
          setDescripcion(p.descripcion ?? "");
          setIdCategoria(p.idCategoria);
          setIdUnidad(p.idUnidad);
          setCantidad(String(Number(p.cantidadDisponible)));
          setPrecio(String(Number(p.precioReferencial)));
        }
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "No se pudo cargar el formulario.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCategoria || !idUnidad) {
      setError("Selecciona categoría y unidad.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        nombre,
        descripcion: descripcion || undefined,
        idCategoria: Number(idCategoria),
        idUnidad: Number(idUnidad),
        cantidadDisponible: Number(cantidad),
        precioReferencial: Number(precio),
      };
      if (isEditing && id) {
        await api.patch(`/products/${id}`, payload);
      } else {
        await api.post(`/products`, payload);
      }
      navigate("/products");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-500">Cargando…</p>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{isEditing ? "Editar Producto" : "Registrar Producto"}</h1>
          <p className="text-gray-500 mt-1 text-lg">
            {isEditing ? "Actualiza cantidad, precio referencial y datos del producto" : "Ofrece una nueva cosecha"}
          </p>
        </div>
      </header>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold">{error}</div>}

      <Card className="border-green-100 shadow-md">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg">Nombre del Producto</Label>
              <Input id="name" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="category" className="text-lg">Categoría</Label>
              <select
                id="category"
                className="flex h-14 w-full rounded-xl border-2 border-gray-300 bg-transparent px-4 py-2 text-lg transition-colors focus-visible:outline-none focus-visible:border-green-600"
                value={idCategoria}
                onChange={(e) => setIdCategoria(Number(e.target.value))}
                required
              >
                <option value="" disabled>Selecciona una categoría...</option>
                {categories.map((c) => (
                  <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400">Catálogo administrado por la Asociación.</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-lg">Descripción (Opcional)</Label>
              <Textarea id="description" rows={3} className="resize-none" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="unit" className="text-lg">Unidad de Medida</Label>
                <select
                  id="unit"
                  className="flex h-14 w-full rounded-xl border-2 border-gray-300 bg-transparent px-4 py-2 text-lg transition-colors focus-visible:outline-none focus-visible:border-green-600"
                  value={idUnidad}
                  onChange={(e) => setIdUnidad(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>Selecciona...</option>
                  {units.map((u) => (
                    <option key={u.idUnidad} value={u.idUnidad}>{u.nombre} ({u.abreviatura})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="quantity" className="text-lg">Cantidad Disponible</Label>
                <Input id="quantity" type="number" min="0" step="0.01" required value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="price" className="text-lg">Precio Referencial (Q)</Label>
              <Input id="price" type="number" step="0.01" min="0" required value={precio} onChange={(e) => setPrecio(e.target.value)} />
              <p className="text-xs text-gray-400">Este precio es solo referencial. El precio final se negocia por solicitud.</p>
            </div>

            <div className="pt-6">
              <Button type="submit" disabled={saving} size="lg" className="w-full gap-2 text-xl py-6">
                <Save className="w-6 h-6" /> {saving ? "Guardando…" : isEditing ? "Guardar Cambios" : "Guardar Producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
