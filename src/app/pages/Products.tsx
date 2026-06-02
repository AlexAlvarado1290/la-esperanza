import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Sprout, ShoppingCart, Info, Search, Filter } from "lucide-react";
import { Button, Card, CardContent, Input, Badge } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import { useRole } from "../../lib/auth";
import type { Producto } from "../../lib/types";

type SortKey = "fecha" | "cantidad" | "precio" | "nombre";

export function ProductsList() {
  const role = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("fecha");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (role === "producer") {
          const data = await api.get<{ items: Producto[]; summary: any }>("/products/mine");
          if (!cancel) setProducts(data.items);
        } else {
          const data = await api.get<Producto[]>("/catalog/products", {
            anonymous: role === "guest",
            query: {
              q: searchTerm || undefined,
              orderBy: sortBy,
              order: sortBy === "cantidad" || sortBy === "fecha" ? "desc" : "asc",
            },
          });
          if (!cancel) setProducts(data);
        }
      } catch (e) {
        if (!cancel) setError(e instanceof ApiError ? e.message : "No se pudo cargar.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [role, sortBy, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {role === "buyer" || role === "guest"
              ? "Catálogo de Productos"
              : role === "producer"
                ? "Mis Productos"
                : "Productos Registrados"}
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            {role === "buyer" || role === "guest"
              ? "Productos agrícolas disponibles"
              : role === "producer"
                ? "Gestiona tu inventario agrícola"
                : "Supervisión de productos publicados"}
          </p>
        </div>
        {role === "producer" && (
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
        <Button variant="outline" size="icon" className="h-14 w-14 shrink-0 border-2" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-6 h-6" />
        </Button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-3">Ordenar por:</p>
          <div className="flex flex-wrap gap-2">
            {([
              { key: "fecha", label: "Fecha (más reciente)" },
              { key: "cantidad", label: "Disponibilidad" },
              { key: "precio", label: "Precio" },
              { key: "nombre", label: "Nombre" },
            ] as { key: SortKey; label: string }[]).map((opt) => (
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

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold">{error}</div>}
      {loading && <p className="text-center py-8 text-gray-500">Cargando…</p>}

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {!loading && products.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 text-lg">
            No se encontraron productos.
          </div>
        ) : (
          products.map((product) => {
            const isDisponible = product.estadoProducto === "DISPONIBLE";
            const cantidadNum = Number(product.cantidadDisponible);
            return (
              <Card key={product.idProducto} className="hover:border-green-400 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{product.nombre}</h2>
                      <p className="text-green-700 font-semibold text-base">{product.categoria.nombre}</p>
                    </div>
                    <Badge variant={isDisponible ? "success" : "danger"} className="text-sm px-3 py-1 uppercase tracking-wide font-bold">
                      {product.estadoProducto.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 text-lg font-medium">Cantidad:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {cantidadNum} {product.unidad.abreviatura}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-lg font-medium">Precio ref:</span>
                      <span className="text-2xl font-black text-green-700">
                        Q{Number(product.precioReferencial).toFixed(2)}{" "}
                        <span className="text-lg font-normal text-gray-500">/{product.unidad.abreviatura}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link to={`/products/${product.idProducto}`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2 text-lg h-14">
                        <Info className="w-5 h-5" /> Detalles
                      </Button>
                    </Link>
                    {role === "producer" ? (
                      <Link to={`/products/${product.idProducto}/edit`} className="flex-1">
                        <Button className="w-full gap-2 text-lg h-14">Editar</Button>
                      </Link>
                    ) : role === "guest" ? (
                      <Link to="/login" className="flex-1">
                        <Button className="w-full gap-2 text-lg h-14">
                          <ShoppingCart className="w-5 h-5" /> Ingresar para Comprar
                        </Button>
                      </Link>
                    ) : role === "buyer" ? (
                      <Link to={`/products/${product.idProducto}`} className="flex-1">
                        <Button className="w-full gap-2 text-lg h-14" disabled={!isDisponible}>
                          <ShoppingCart className="w-5 h-5" /> Solicitar
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
