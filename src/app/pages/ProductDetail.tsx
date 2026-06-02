import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ShoppingCart, User, CheckCircle2 } from "lucide-react";
import { Button, Card, CardContent, Badge, Input, Label, Textarea } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import { useRole } from "../../lib/auth";
import type { Producto } from "../../lib/types";

export function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = useRole();
  const [product, setProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qty, setQty] = useState("1");
  const [message, setMessage] = useState("");
  const [requested, setRequested] = useState<{ idSolicitud: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const p = await api.get<Producto>(`/catalog/products/${id}`, { anonymous: role === "guest" });
        setProduct(p);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, role]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{ idSolicitud: number }>("/requests", {
        idProducto: product.idProducto,
        cantidadSolicitada: Number(qty),
        mensajeInicial: message || undefined,
      });
      setRequested(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al enviar solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center py-12 text-gray-500">Cargando…</p>;
  if (error || !product)
    return (
      <div className="text-center py-12 text-red-600">
        {error ?? "Producto no disponible."}
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate("/products")}>Volver al catálogo</Button>
        </div>
      </div>
    );

  const cantidadNum = Number(product.cantidadDisponible);
  const precioNum = Number(product.precioReferencial);
  const isDisponible = product.estadoProducto === "DISPONIBLE" && cantidadNum > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div><h1 className="text-3xl font-extrabold text-gray-900">Detalles del Producto</h1></div>
      </header>

      {requested ? (
        <Card className="border-t-4 border-t-green-500 shadow-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">¡Solicitud Enviada!</h2>
            <p className="text-gray-600 text-lg">
              Tu solicitud por <strong>{qty} {product.unidad.abreviatura}</strong> de <strong>{product.nombre}</strong> ha sido enviada al productor.
            </p>
            {message && (
              <div className="bg-gray-50 p-4 rounded-xl text-left">
                <p className="text-sm font-semibold text-gray-500 mb-1">Tu mensaje:</p>
                <p className="text-gray-700">{message}</p>
              </div>
            )}
            <div className="pt-6">
              <Button onClick={() => navigate("/agreements")} size="lg" className="w-full">Ver mis solicitudes</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md border-gray-100">
          <CardContent className="p-0">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2 uppercase tracking-wide bg-green-100 text-green-800">{product.categoria.nombre}</Badge>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">{product.nombre}</h2>
                  <p className="text-gray-600 text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-green-700" /> Productor: <span className="font-bold">{product.productor.nombreCompleto}</span>
                  </p>
                </div>
                <Badge variant={isDisponible ? "success" : "danger"} className="px-3 py-1 uppercase font-bold">
                  {product.estadoProducto.toLowerCase()}
                </Badge>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-gray-500 font-medium text-lg">Cantidad Disp.</p>
                  <p className="text-2xl font-black text-gray-900">{cantidadNum} {product.unidad.abreviatura}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 font-medium text-lg">Precio ref.</p>
                  <p className="text-3xl font-black text-green-700">
                    Q{precioNum.toFixed(2)} <span className="text-lg font-normal text-gray-500">/{product.unidad.abreviatura}</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Descripción</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{product.descripcion ?? "Sin descripción adicional."}</p>
              </div>

              <p className="text-sm text-gray-400">El precio publicado es solo referencial. El precio final se negocia dentro de la solicitud.</p>

              {role === "buyer" && isDisponible && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Registrar Solicitud de Compra</h3>
                  <form onSubmit={handleRequest} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-lg">Cantidad ({product.unidad.abreviatura})</Label>
                        <Input type="number" min="1" max={cantidadNum} step="0.01" value={qty} onChange={(e) => setQty(e.target.value)} required className="h-14 text-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-lg">Total Base (ref.)</Label>
                        <div className="h-14 bg-gray-100 rounded-lg flex items-center px-4 text-xl font-bold text-gray-900">
                          Q{(precioNum * Number(qty || "0")).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-lg">Mensaje o comentario para negociar</Label>
                      <Textarea className="resize-none h-24 text-lg p-4" value={message} onChange={(e) => setMessage(e.target.value)} />
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold">{error}</div>}

                    <Button type="submit" disabled={submitting} size="lg" className="w-full gap-2 text-lg h-16 mt-4 shadow-sm">
                      <ShoppingCart className="w-6 h-6" /> {submitting ? "Enviando…" : "Enviar Solicitud de Compra"}
                    </Button>
                  </form>
                </div>
              )}

              {role === "guest" && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl text-center space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">¿Interesado en este producto?</h3>
                    <p className="text-gray-600">Solicita una cuenta a la Asociación para contactar al productor y realizar tu pedido.</p>
                    <Button onClick={() => navigate("/login")} size="lg" className="w-full text-lg h-14 mt-2">Iniciar Sesión</Button>
                  </div>
                </div>
              )}

              {role === "admin" && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-sm text-blue-800">
                    <p className="font-semibold">Vista de supervisión</p>
                    <p>Como administrador puedes revisar los productos publicados. Las solicitudes de compra son gestionadas entre compradores y productores.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
