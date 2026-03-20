import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ShoppingCart, User, Sprout, CheckCircle2 } from "lucide-react";
import { Button, Card, CardContent, Badge, Input, Label, Textarea } from "../components/ui";
import { useState } from "react";

const initialProducts = [
  { id: 1, name: "Papas Super Chola", category: "Tubérculos", producer: "Juan Pérez", price: "25.00", unit: "Quintal", quantity: 50, description: "Papas frescas de la comunidad de San Juan, cosechadas esta misma semana. Ideales para consumo familiar y restaurantes." },
  { id: 2, name: "Maíz Amarillo", category: "Cereales", producer: "María Gómez", price: "18.50", unit: "Quintal", quantity: 120, description: "Maíz secado al sol de excelente calidad para elaboración de balanceado y consumo." },
  { id: 3, name: "Tomate Riñón", category: "Hortalizas", producer: "Asociación San José", price: "12.00", unit: "Caja", quantity: 30, description: "Tomates frescos y orgánicos." },
  { id: 4, name: "Cebolla Blanca", category: "Hortalizas", producer: "Luis Cando", price: "15.00", unit: "Saco", quantity: 0, description: "Cebolla de tallo grueso y sabor suave." },
  { id: 5, name: "Zanahoria Amarilla", category: "Hortalizas", producer: "María Gómez", price: "8.00", unit: "Saco", quantity: 45, description: "Zanahorias frescas de la sierra, excelentes para sopas y jugos." },
  { id: 6, name: "Fréjol Canario", category: "Cereales", producer: "Juan Pérez", price: "22.00", unit: "Quintal", quantity: 60, description: "Fréjol de primera calidad, cosecha reciente." },
];

export function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [qty, setQty] = useState("1");
  const [message, setMessage] = useState("");
  const [requested, setRequested] = useState(false);

  const product = initialProducts.find(p => p.id === Number(id)) || initialProducts[0];
  const role = localStorage.getItem('userRole') || 'admin';

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequested(true);
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
          <h1 className="text-3xl font-extrabold text-gray-900">Detalles del Producto</h1>
        </div>
      </header>

      {requested ? (
        <Card className="border-t-4 border-t-green-500 shadow-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">¡Solicitud Enviada!</h2>
            <p className="text-gray-600 text-lg">Tu solicitud de compra por <strong>{qty} {product.unit}{parseInt(qty) > 1 ? 'es' : ''}</strong> de <strong>{product.name}</strong> ha sido enviada al productor.</p>
            {message && (
              <div className="bg-gray-50 p-4 rounded-xl text-left">
                <p className="text-sm font-semibold text-gray-500 mb-1">Tu mensaje:</p>
                <p className="text-gray-700">{message}</p>
              </div>
            )}
            <div className="pt-6">
              <Button onClick={() => navigate('/agreements')} size="lg" className="w-full">
                Ver mis solicitudes
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md border-gray-100">
          <CardContent className="p-0">
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2 uppercase tracking-wide bg-green-100 text-green-800">
                    {product.category}
                  </Badge>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">{product.name}</h2>
                  {/* Productor visible solo en detalle */}
                  <p className="text-gray-600 text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-green-700" />
                    Productor: <span className="font-bold">{product.producer}</span>
                  </p>
                </div>
                <Badge
                  variant={product.quantity > 0 ? "success" : "danger"}
                  className="px-3 py-1 uppercase font-bold"
                >
                  {product.quantity > 0 ? "Disponible" : "Agotado"}
                </Badge>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-gray-500 font-medium text-lg">Cantidad Disp.</p>
                  <p className="text-2xl font-black text-gray-900">{product.quantity} {product.unit}{product.quantity !== 1 ? 'es' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 font-medium text-lg">Precio ref.</p>
                  <p className="text-3xl font-black text-green-700">
                    Q{product.price} <span className="text-lg font-normal text-gray-500">/{product.unit}</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Descripción</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              <p className="text-sm text-gray-400">El precio publicado es solo referencial. El precio final se negocia dentro de la solicitud.</p>

              {/* Solo comprador puede solicitar */}
              {role === 'buyer' && product.quantity > 0 && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Registrar Solicitud de Compra</h3>
                  <form onSubmit={handleRequest} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-lg">Cantidad ({product.unit}{parseInt(qty) > 1 ? 'es' : ''})</Label>
                        <Input
                          type="number"
                          min="1"
                          max={product.quantity}
                          value={qty}
                          onChange={(e) => setQty(e.target.value)}
                          required
                          className="h-14 text-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-lg">Total Base (ref.)</Label>
                        <div className="h-14 bg-gray-100 rounded-lg flex items-center px-4 text-xl font-bold text-gray-900">
                          Q{(parseFloat(product.price) * parseInt(qty || "0")).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-lg">Mensaje o comentario para negociar</Label>
                      <Textarea
                        placeholder="Ej. Me gustaría negociar el precio a Q20.00 por la cantidad..."
                        className="resize-none h-24 text-lg p-4"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2 text-lg h-16 mt-4 shadow-sm">
                      <ShoppingCart className="w-6 h-6" /> Enviar Solicitud de Compra
                    </Button>
                  </form>
                </div>
              )}

              {/* Invitado: CTA para login */}
              {role === 'guest' && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl text-center space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">¿Interesado en este producto?</h3>
                    <p className="text-gray-600">Solicita una cuenta a la Asociación para contactar al productor y realizar tu pedido.</p>
                    <Button onClick={() => navigate('/login')} size="lg" className="w-full text-lg h-14 mt-2">
                      Iniciar Sesión
                    </Button>
                  </div>
                </div>
              )}

              {/* Admin: solo supervisa */}
              {role === 'admin' && (
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