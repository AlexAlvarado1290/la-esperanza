import { useNavigate, useSearchParams } from "react-router";
import { UserPlus, Save, ArrowLeft, Info } from "lucide-react";
import { Button, Card, CardContent, Input, Label } from "../components/ui";

export function UserForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/users");
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
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isEditing ? 'Editar Usuario' : 'Alta de Usuario'}
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            {isEditing ? 'Modificar datos del usuario' : 'Registro por parte de la Asociación'}
          </p>
        </div>
      </header>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          {isEditing
            ? 'Los campos protegidos (DPI, teléfono, tipo) no pueden modificarse. Use "Reiniciar PIN" desde la lista de usuarios si es necesario.'
            : 'Solo la Asociación puede dar de alta nuevos usuarios. El PIN inicial será 0000 y el usuario deberá cambiarlo al primer ingreso.'
          }
        </p>
      </div>

      <Card className="border-green-100 shadow-md">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="type" className="text-lg">Tipo de Usuario</Label>
              <select
                id="type"
                className="flex h-14 w-full rounded-xl border-2 border-gray-300 bg-transparent px-4 py-2 text-lg transition-colors focus-visible:outline-none focus-visible:border-green-600 disabled:bg-gray-100 disabled:text-gray-500"
                required
                disabled={isEditing}
              >
                <option value="productor">Productor Agrícola</option>
                <option value="comprador">Comprador</option>
              </select>
              {isEditing && <p className="text-xs text-gray-400">El tipo de usuario no se puede modificar.</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="dpi" className="text-lg">DPI / CUI</Label>
              <Input
                id="dpi"
                placeholder="Ej: 1234567890101"
                required
                disabled={isEditing}
                className={isEditing ? "bg-gray-100 text-gray-500" : ""}
                defaultValue={isEditing ? "1234567890101" : ""}
              />
              {isEditing && <p className="text-xs text-gray-400">El número de identificación no se puede modificar.</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg">Nombre Completo o Empresa</Label>
              <Input
                id="name"
                placeholder="Ej: Juan Pérez o Restaurante El Sabor"
                required
                defaultValue={isEditing ? "Juan Pérez" : ""}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-lg">Teléfono de Contacto (será su usuario de acceso)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Ej: 0987654321"
                required
                disabled={isEditing}
                className={isEditing ? "bg-gray-100 text-gray-500" : ""}
                defaultValue={isEditing ? "0991234567" : ""}
              />
              {isEditing && <p className="text-xs text-gray-400">El teléfono principal no se puede modificar.</p>}
              {!isEditing && <p className="text-xs text-gray-500">Este número será usado para iniciar sesión junto con el PIN.</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="location" className="text-lg">Dirección o Comunidad</Label>
              <Input
                id="location"
                placeholder="Ej: Comunidad San José"
                required
                defaultValue={isEditing ? "Sector Norte" : ""}
              />
            </div>

            {!isEditing && (
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl">
                <p className="text-sm text-yellow-800 font-semibold">
                  PIN inicial: <span className="font-mono text-lg">0000</span>
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  El usuario deberá cambiar su PIN desde su perfil al primer ingreso.
                </p>
              </div>
            )}

            <div className="pt-6">
              <Button type="submit" size="lg" className="w-full gap-2 text-xl py-6">
                {isEditing ? <Save className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                {isEditing ? 'Guardar Cambios' : 'Registrar Usuario'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
