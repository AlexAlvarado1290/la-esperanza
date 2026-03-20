import { useState } from "react";
import { Link } from "react-router";
import { Sprout, ShoppingCart, Info, Search, Filter, ChevronDown } from "lucide-react";
import { Button, Card, CardContent, Input, Badge } from "../components/ui";

const initialProducts = [
  { id: 1, name: "Papas Super Chola", category: "Tubérculos", producer: "Juan Pérez", price: "25.00", unit: "Quintal", quantity: 50 },
  { id: 2, name: "Maíz Amarillo", category: "Cereales", producer: "María Gómez", price: "18.50", unit: "Quintal", quantity: 120 },
  { id: 3, name: "Tomate Riñón", category: "Hortalizas", producer: "Asociación San José", price: "12.00", unit: "Caja", quantity: 30 },
  { id: 4, name: "Cebolla Blanca", category: "Hortalizas", producer: "Luis Cando", price: "15.00", unit: "Saco", quantity: 0 },
  { id: 5, name: "Zanahoria Amarilla", category: "Hortalizas", producer: "María Gómez", price: "8.00", unit: "Saco", quantity: 45 },
  { id: 6, name: "Fréjol Canario", category: "Cereales", producer: "Juan Pérez", price: "22.00", unit: "Quintal", quantity: 60 },
];

type SortKey = "categoria" | "disponibilidad" | "precio" | "unidad";

export function ProductsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products] = useState(initialProducts);
  const [sortBy, setSortBy] = useState<SortKey>("disponibilidad");
  const [showFilters, setShowFilters] = useState(false);
  const role = localStorage.getItem('userRole') || 'admin';

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "categoria": return a.category.localeCompare(b.category);
        case "disponibilidad": return b.quantity - a.quantity;
        case "precio": return parseFloat(a.price) - parseFloat(b.price);
        case "unidad": return a.unit.localeCompare(b.unit);
        default: return 0;
      }
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {role === 'buyer' || role === 'guest' ? 'Catálogo de Productos' : role === 'producer' ? 'Mis Productos' : 'Productos Registrados'}
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            {role === 'buyer' || role === 'guest' ? 'Productos agrícolas disponibles' : role === 'producer' ? 'Gestiona tu inventario agrícola' : 'Supervisión de productos publicados'}
          </p>
        </div>
        {role === 'producer' && (
          <Link to="/products/new">
            <Button className="w-full sm:w-auto text-lg gap-2" size="lg">
              <Sprout className="w-6 h-6" /> Añadir Producto
            </Button>
          </Link>
        )}
      </header>

      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          <Input
            placeholder="Buscar por nombre o categoría..."
            className="pl-12 h-14 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 shrink-0 border-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-6 h-6" />
        </Button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-3">Ordenar por:</p>
          <div className="flex flex-wrap gap-2">
            {([
              { key: "disponibilidad", label: "Disponibilidad" },
              { key: "categoria", label: "Categoría" },
              { key: "precio", label: "Precio" },
              { key: "unidad", label: "Unidad" },
            ] as { key: SortKey; label: string }[]).map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  sortBy === opt.key ? "bg-green-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 text-lg">
            No se encontraron productos.
          </div>
        ) : (
          filtered.map((product) => (
            <Card key={product.id} className="hover:border-green-400 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                    <p className="text-green-700 font-semibold text-base">{product.category}</p>
                  </div>
                  <Badge
                    variant={product.quantity > 0 ? "success" : "danger"}
                    className="text-sm px-3 py-1 uppercase tracking-wide font-bold"
                  >
                    {product.quantity > 0 ? "Disponible" : "Agotado"}
                  </Badge>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-lg font-medium">Cantidad:</span>
                    <span className="text-xl font-bold text-gray-900">
                      {product.quantity} {product.unit}{product.quantity !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-lg font-medium">Precio ref:</span>
                    <span className="text-2xl font-black text-green-700">
                      Q{product.price} <span className="text-lg font-normal text-gray-500">/{product.unit}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link to={`/products/${product.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2 text-lg h-14">
                      <Info className="w-5 h-5" /> Detalles
                    </Button>
                  </Link>

                  {role === 'producer' ? (
                    <Link to={`/products/${product.id}`} className="flex-1">
                      <Button className="w-full gap-2 text-lg h-14">
                        Editar
                      </Button>
                    </Link>
                  ) : role === 'guest' ? (
                    <Link to="/login" className="flex-1">
                      <Button className="w-full gap-2 text-lg h-14">
                        <ShoppingCart className="w-5 h-5" /> Ingresar para Comprar
                      </Button>
                    </Link>
                  ) : role === 'buyer' ? (
                    <Link to={`/products/${product.id}`} className="flex-1">
                      <Button
                        className="w-full gap-2 text-lg h-14"
                        disabled={product.quantity === 0}
                      >
                        <ShoppingCart className="w-5 h-5" /> Solicitar
                      </Button>
                    </Link>
                  ) : null /* admin: solo detalle, no solicitar */}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}