import { useNavigate } from "react-router";
import { Sprout, ArrowLeft, Save } from "lucide-react";
import { Button, Card, CardContent, Input, Label } from "../components/ui";

export function ProductForm() {
  const navigate = useNavigate();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/products");
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
          <h1 className="text-3xl font-extrabold text-gray-900">Registrar Producto</h1>
          <p className="text-gray-500 mt-1 text-lg">Ofrece una nueva cosecha</p>
        </div>
      </header>

      <Card className="border-green-100 shadow-md">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg">Nombre del Producto</Label>
              <Input id="name" placeholder="Ej: Papas Super Chola" required />
            </div>

            <div className="space-y-3">
              <Label htmlFor="category" className="text-lg">Categoría</Label>
              <select
                id="category"
                className="flex h-14 w-full rounded-xl border-2 border-gray-300 bg-transparent px-4 py-2 text-lg transition-colors focus-visible:outline-none focus-visible:border-green-600"
                required
              >
                <option value="tubérculos">Tubérculos</option>
                <option value="hortalizas">Hortalizas</option>
                <option value="cereales">Cereales</option>
                <option value="frutas">Frutas</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-lg">Descripción (Opcional)</Label>
              <textarea
                id="description"
                rows={3}
                className="flex w-full rounded-xl border-2 border-gray-300 bg-transparent px-4 py-3 text-lg transition-colors focus-visible:outline-none focus-visible:border-green-600"
                placeholder="Detalles sobre el producto..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="unit" className="text-lg">Unidad de Medida</Label>
                <select
                  id="unit"
                  className="flex h-14 w-full rounded-xl border-2 border-gray-300 bg-transparent px-4 py-2 text-lg transition-colors focus-visible:outline-none focus-visible:border-green-600"
                  required
                >
                  <option value="quintal">Quintal</option>
                  <option value="saco">Saco</option>
                  <option value="caja">Caja</option>
                  <option value="libra">Libra</option>
                  <option value="kilo">Kilo</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="quantity" className="text-lg">Cantidad Disponible</Label>
                <Input id="quantity" type="number" min="0" placeholder="Ej: 50" required />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="price" className="text-lg">Precio Referencial (Q)</Label>
              <Input id="price" type="number" step="0.01" min="0" placeholder="Ej: 25.00" required />
            </div>

            <div className="pt-6">
              <Button type="submit" size="lg" className="w-full gap-2 text-xl py-6">
                <Save className="w-6 h-6" /> Guardar Producto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}