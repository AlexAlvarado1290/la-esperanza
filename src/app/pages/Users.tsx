import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { UserPlus, Edit2, ShieldBan, ShieldCheck, KeyRound, Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button, Card, CardContent, Badge } from "../components/ui";

interface UserData {
  id: number;
  name: string;
  type: "productor" | "comprador";
  phone: string;
  location: string;
  status: "activo" | "suspendido" | "bloqueado";
  reports: number;
  deliveries: number;
  trust: "alta" | "media" | "baja";
}

const initialUsers: UserData[] = [
  { id: 1, name: "Juan Pérez", type: "productor", phone: "0991234567", location: "Sector Norte", status: "activo", reports: 0, deliveries: 34, trust: "alta" },
  { id: 2, name: "María Gómez", type: "productor", phone: "0987654321", location: "Sector Sur", status: "activo", reports: 1, deliveries: 18, trust: "media" },
  { id: 3, name: "Restaurante El Sabor", type: "comprador", phone: "022345678", location: "Centro", status: "activo", reports: 0, deliveries: 12, trust: "alta" },
  { id: 4, name: "Mercado Central", type: "comprador", phone: "0998877665", location: "Plaza Mayor", status: "suspendido", reports: 3, deliveries: 5, trust: "baja" },
  { id: 5, name: "Luis Cando", type: "productor", phone: "0976543210", location: "Sector Oeste", status: "bloqueado", reports: 5, deliveries: 2, trust: "baja" },
];

const trustColors = {
  alta: "success",
  media: "warning",
  baja: "danger",
} as const;

const statusColors = {
  activo: "success",
  suspendido: "warning",
  bloqueado: "danger",
} as const;

export function UsersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState(initialUsers);
  const [pinReset, setPinReset] = useState<number | null>(null);

  const filterType = searchParams.get("tab") || "todos";

  const filteredUsers = users.filter((u) => {
    if (filterType === "todos") return true;
    if (filterType === "productor") return u.type === "productor";
    if (filterType === "comprador") return u.type === "comprador";
    return true;
  });

  const cycleStatus = (userId: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const cycle: Record<string, "activo" | "suspendido" | "bloqueado"> = {
        activo: "suspendido",
        suspendido: "bloqueado",
        bloqueado: "activo",
      };
      return { ...u, status: cycle[u.status] };
    }));
  };

  const handleResetPin = (userId: number) => {
    setPinReset(userId);
    setTimeout(() => setPinReset(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1 text-lg">Solo la Asociación puede crear y administrar cuentas</p>
        </div>
        <Link to="/users/new">
          <Button className="w-full sm:w-auto text-lg gap-2" size="lg">
            <UserPlus className="w-6 h-6" /> Alta de Usuario
          </Button>
        </Link>
      </header>

      <div className="bg-white p-2 rounded-2xl flex flex-wrap gap-2 border border-gray-200 shadow-sm">
        {[
          { key: "todos", label: "Todos" },
          { key: "productor", label: "Productores" },
          { key: "comprador", label: "Compradores" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSearchParams({ tab: tab.key })}
            className={`flex-1 min-w-[100px] text-lg font-bold py-3 px-4 rounded-xl transition-colors ${
              filterType === tab.key ? "bg-green-700 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 mt-6">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-12">No hay usuarios en esta categoría.</p>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:border-green-400 transition-colors">
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                      <Badge variant={statusColors[user.status]} className="text-xs uppercase px-2 py-0.5">
                        {user.status}
                      </Badge>
                    </div>
                    <div className="text-gray-600 text-lg space-y-1">
                      <p><span className="font-semibold">Tel:</span> {user.phone}</p>
                      <p><span className="font-semibold">Ubicación:</span> {user.location}</p>
                      <p className="capitalize text-green-700 font-bold">{user.type}</p>
                    </div>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex flex-col items-start sm:items-end gap-2 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-700">Confiabilidad:</span>
                      <Badge variant={trustColors[user.trust]} className="text-xs uppercase">{user.trust}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">{user.deliveries}</span> entregas
                    </p>
                    {user.reports > 0 && (
                      <p className="text-sm text-red-600 flex items-center gap-1 font-semibold">
                        <AlertTriangle className="w-4 h-4" /> {user.reports} reporte{user.reports > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* PIN reset success */}
                {pinReset === user.id && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5" /> PIN reiniciado a 0000. El usuario debe cambiarlo al ingresar.
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <Link to={`/users/new?edit=true&userId=${user.id}`}>
                    <Button variant="outline" size="sm" className="gap-2 text-base">
                      <Edit2 className="w-4 h-4" /> Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-base border-orange-200 text-orange-700 hover:bg-orange-50"
                    onClick={() => handleResetPin(user.id)}
                  >
                    <KeyRound className="w-4 h-4" /> Reiniciar PIN
                  </Button>
                  <Button
                    variant={user.status === "activo" ? "danger" : "default"}
                    size="sm"
                    className="gap-2 text-base"
                    onClick={() => cycleStatus(user.id)}
                  >
                    {user.status === "activo" ? (
                      <><ShieldBan className="w-4 h-4" /> Suspender</>
                    ) : user.status === "suspendido" ? (
                      <><ShieldBan className="w-4 h-4" /> Bloquear</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /> Reactivar</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
