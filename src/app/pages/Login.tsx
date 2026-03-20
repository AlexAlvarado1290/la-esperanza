import { useState } from "react";
import { useNavigate } from "react-router";
import { Sprout, Phone, Lock, AlertCircle } from "lucide-react";
import { Button, Card, CardContent, Input, Label } from "../components/ui";

const dummyUsers = [
  { role: 'admin', phone: '0999999991', pin: '1111', label: 'Administrador / Asociación' },
  { role: 'producer', phone: '0999999992', pin: '2222', label: 'Productor' },
  { role: 'buyer', phone: '0999999993', pin: '3333', label: 'Comprador' },
] as const;

export function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = dummyUsers.find(u => u.phone === phone && u.pin === pin);
    
    if (user) {
      setError(false);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.label);
      localStorage.setItem('userPhone', user.phone);
      navigate("/dashboard");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="bg-green-100 p-6 rounded-full mb-6 shadow-sm">
          <Sprout className="w-16 h-16 text-green-700" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">La Esperanza</h1>
        <p className="text-gray-500 text-center mb-8 text-lg">
          Comunidad Agrícola Rural
        </p>

        <Card className="w-full shadow-lg border-gray-100 bg-white">
          <CardContent className="pt-8 pb-8 space-y-6">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Iniciar Sesión</h2>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-lg">Número de Celular</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <Input 
                    id="phone"
                    type="tel"
                    placeholder="Ej. 0999999991"
                    className="pl-12 text-lg h-14"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-lg">PIN de 4 dígitos</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <Input 
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="••••"
                    className="pl-12 text-2xl tracking-[0.5em] font-bold h-14"
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPin(val);
                    }}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">Credenciales incorrectas. Verifica tu número y PIN.</p>
                </div>
              )}

              <Button type="submit" className="w-full h-16 text-xl mt-4 bg-green-700 hover:bg-green-800 text-white shadow-md">
                Ingresar
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  localStorage.setItem('userRole', 'guest');
                  navigate("/products");
                }} 
                className="w-full h-14 text-lg border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Ver catálogo sin cuenta
              </Button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-2">
              ¿No tienes cuenta? Solicítala a la Asociación.
            </p>
          </CardContent>
        </Card>

        {/* Ayuda de prueba */}
        <div className="mt-8 w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl">
          <p className="text-blue-800 text-sm font-bold mb-3 text-center">Datos de Prueba</p>
          <div className="space-y-2">
            {dummyUsers.map((u) => (
              <button
                key={u.role}
                onClick={() => { setPhone(u.phone); setPin(u.pin); }}
                className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-blue-100 w-full hover:bg-blue-50 transition-colors"
              >
                <span className="font-bold text-gray-700">{u.label}</span>
                <span className="text-gray-600 font-mono text-base">{u.phone} / {u.pin}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
